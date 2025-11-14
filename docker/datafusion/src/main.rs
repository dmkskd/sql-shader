use anyhow::{Context, Result};
use arrow::ipc::writer::StreamWriter;
use arrow::json::writer::ArrayWriter;
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

    // Execute the query
    let df = state
        .ctx
        .sql(&payload.query)
        .await
        .context("Failed to parse SQL query")?;

    let batches = df
        .collect()
        .await
        .context("Failed to execute query")?;

    // Return format based on request
    let format = if payload.format.is_empty() {
        "arrow"
    } else {
        &payload.format
    };

    match format {
        "arrow" => {
            // Return Arrow IPC stream format
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

            Ok((
                StatusCode::OK,
                [("Content-Type", "application/vnd.apache.arrow.stream")],
                buffer,
            )
                .into_response())
        }
        "json" => {
            // Convert to JSON format
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
                let mut json_writer = arrow::json::writer::ArrayWriter::new(&mut buf);
                json_writer.write(batch).context("Failed to write JSON")?;
                json_writer.finish().context("Failed to finish JSON")?;
                
                let json_array: Vec<serde_json::Value> = serde_json::from_slice(&buf)
                    .context("Failed to parse JSON")?;
                all_rows.extend(json_array);
            }

            // Optionally collect metrics
            let metrics = if payload.collect_metrics {
                Some(serde_json::json!({
                    "batches": batches.len(),
                    "total_rows": all_rows.len(),
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
