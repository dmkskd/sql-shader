use anyhow::{Context, Result};
use datafusion::arrow::ipc::writer::StreamWriter;
use datafusion::arrow::json::ArrayWriter;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use datafusion::prelude::*;
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;
use tracing::{error, info};

/// Application state shared across handlers
#[derive(Clone)]
struct AppState {
    ctx: SessionContext,
}

/// Request body for SQL query execution
#[derive(Debug, Deserialize)]
struct QueryRequest {
    query: String,
    #[serde(default)]
    format: String, // "arrow" or "json" (default: "arrow")
    #[serde(default)]
    collect_metrics: bool, // Whether to collect execution metrics
}

/// Response for JSON format queries
#[derive(Debug, Serialize)]
struct QueryResponse {
    data: Vec<serde_json::Value>,
    rows: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    schema: Option<Vec<ColumnInfo>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    metrics: Option<serde_json::Value>,
}

/// Column metadata for schema information
#[derive(Debug, Serialize)]
struct ColumnInfo {
    name: String,
    #[serde(rename = "type")]
    data_type: String,
}

/// Health check response
#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

/// Error response wrapper
#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

/// Custom error type for HTTP responses
struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        error!("Request error: {}", self.0);
        let message = format!("{:#}", self.0);
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: message }),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "datafusion_server=info,datafusion=warn".into()),
        )
        .init();

    info!("Starting DataFusion HTTP Server...");

    // Create DataFusion session context
    let ctx = SessionContext::new();
    
    // Register sample data or UDFs here if needed
    // For now, we'll just allow ad-hoc queries
    
    let state = AppState { ctx };

    // Build the router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/ping", get(ping))
        .route("/query", post(execute_query))
        .layer(CorsLayer::permissive()) // Allow CORS from any origin
        .with_state(state);

    // Bind to all interfaces on port 8124
    let addr = "0.0.0.0:8124";
    info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .context("Failed to bind server")?;

    axum::serve(listener, app)
        .await
        .context("Server error")?;

    Ok(())
}

/// Health check endpoint
async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

/// Ping endpoint (compatible with ClickHouse-style ping)
async fn ping() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "success": true
    }))
}

/// Execute a SQL query and return results
async fn execute_query(
    State(state): State<AppState>,
    Json(payload): Json<QueryRequest>,
) -> Result<Response, AppError> {
    info!("Executing query: {}", payload.query);

    // Start timing
    let start_total = std::time::Instant::now();

    // Parse SQL query
    let parse_start = std::time::Instant::now();
    let df = state
        .ctx
        .sql(&payload.query)
        .await
        .context("Failed to parse SQL query")?;
    let parse_duration = parse_start.elapsed();

    // Execute query and collect results
    let execution_start = std::time::Instant::now();
    let batches = df
        .collect()
        .await
        .context("Failed to execute query")?;
    let execution_duration = execution_start.elapsed();

    // Calculate total rows across all batches
    let total_rows: usize = batches.iter().map(|b| b.num_rows()).sum();
    let total_batches = batches.len();
    
    // Calculate total bytes (approximate memory usage)
    let total_bytes: usize = batches.iter()
        .map(|b| b.get_array_memory_size())
        .sum();
    
    // Get number of columns
    let num_columns = if !batches.is_empty() {
        batches[0].num_columns()
    } else {
        0
    };
    
    // Get CPU count
    let cpu_count = num_cpus::get();

    // Return format based on request
    let format = if payload.format.is_empty() {
        "arrow"
    } else {
        &payload.format
    };

    match format {
        "arrow" => {
            // Return Arrow IPC stream format
            let serialization_start = std::time::Instant::now();
            let mut buffer = Vec::new();
            
            if !batches.is_empty() {
                let schema = batches[0].schema();
                let mut writer = StreamWriter::try_new(&mut buffer, &schema)
                    .context("Failed to create Arrow writer")?;

                for batch in &batches {
                    writer
                        .write(batch)
                        .context("Failed to write Arrow batch")?;
                }

                writer.finish().context("Failed to finish Arrow stream")?;
            }

            let serialization_duration = serialization_start.elapsed();
            let total_duration = start_total.elapsed();

            // Convert durations to fractional milliseconds for better precision
            let parse_ms = parse_duration.as_secs_f64() * 1000.0;
            let execution_ms = execution_duration.as_secs_f64() * 1000.0;
            let serialization_ms = serialization_duration.as_secs_f64() * 1000.0;
            let total_ms = total_duration.as_secs_f64() * 1000.0;

            // Add metrics as custom headers
            Ok((
                StatusCode::OK,
                [
                    ("Content-Type", "application/vnd.apache.arrow.stream"),
                    ("X-DataFusion-Parse-Ms", &format!("{:.2}", parse_ms)),
                    ("X-DataFusion-Execution-Ms", &format!("{:.2}", execution_ms)),
                    ("X-DataFusion-Serialization-Ms", &format!("{:.2}", serialization_ms)),
                    ("X-DataFusion-Total-Ms", &format!("{:.2}", total_ms)),
                    ("X-DataFusion-Rows", &total_rows.to_string()),
                    ("X-DataFusion-Batches", &total_batches.to_string()),
                    ("X-DataFusion-Bytes", &total_bytes.to_string()),
                    ("X-DataFusion-Columns", &num_columns.to_string()),
                    ("X-DataFusion-CPU-Count", &cpu_count.to_string()),
                    ("X-DataFusion-Rows-Per-Batch", &(if total_batches > 0 { total_rows / total_batches } else { 0 }).to_string()),
                ],
                buffer,
            )
                .into_response())
        }
        "json" => {
            // Convert to JSON format
            let serialization_start = std::time::Instant::now();
            let mut all_rows = Vec::new();
            let mut schema_info = None;

            for batch in &batches {
                if schema_info.is_none() {
                    // Capture schema from first batch
                    schema_info = Some(
                        batch
                            .schema()
                            .fields()
                            .iter()
                            .map(|f| ColumnInfo {
                                name: f.name().clone(),
                                data_type: format!("{}", f.data_type()),
                            })
                            .collect::<Vec<_>>(),
                    );
                }

                // Convert batch to JSON
                let mut buf = Vec::new();
                let mut json_writer = ArrayWriter::new(&mut buf);
                json_writer.write(batch).context("Failed to write JSON")?;
                json_writer.finish().context("Failed to finish JSON")?;
                
                let json_array: Vec<serde_json::Value> = serde_json::from_slice(&buf)
                    .context("Failed to parse JSON")?;
                all_rows.extend(json_array);
            }

            let serialization_duration = serialization_start.elapsed();
            let total_duration = start_total.elapsed();

            // Convert durations to fractional milliseconds for better precision
            let parse_ms = parse_duration.as_secs_f64() * 1000.0;
            let execution_ms = execution_duration.as_secs_f64() * 1000.0;
            let serialization_ms = serialization_duration.as_secs_f64() * 1000.0;
            let total_ms = total_duration.as_secs_f64() * 1000.0;

            // Optionally collect metrics
            let metrics = if payload.collect_metrics {
                Some(serde_json::json!({
                    "batches": total_batches,
                    "total_rows": total_rows,
                    "total_bytes": total_bytes,
                    "columns": num_columns,
                    "timing": {
                        "parse_ms": parse_ms,
                        "execution_ms": execution_ms,
                        "serialization_ms": serialization_ms,
                        "total_ms": total_ms,
                    }
                }))
            } else {
                None
            };

            let response = QueryResponse {
                rows: all_rows.len(),
                data: all_rows,
                schema: schema_info,
                metrics,
            };

            Ok(Json(response).into_response())
        }
        _ => Err(anyhow::anyhow!("Unsupported format: {}", format).into()),
    }
}
