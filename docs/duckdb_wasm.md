# DuckDB WASM Engine

## Gotchas and Common Issues

### Float Type Casting Required for Literal Values

When using literal constants in DuckDB shaders, you must explicitly cast to `FLOAT` to ensure proper Arrow table compatibility:

```sql
-- ❌ WRONG - causes type conversion issues
SELECT 1.0 AS r, 0.5 AS g, 0.0 AS b

-- ✅ CORRECT - explicit float casting
SELECT 1.0::FLOAT AS r, 0.5::FLOAT AS g, 0.0::FLOAT AS b
```

**Why this happens**: DuckDB interprets literal numbers as DECIMAL/INTEGER types that don't convert properly to Arrow Float32 arrays. Mathematical expressions (`sin()`, `cos()`, etc.) automatically return floats and don't have this issue.

**Symptoms**: Solid color shaders show vertical stripe patterns or wrong color values instead of uniform colors.

**Solution**: Always cast literal color values to `::FLOAT` in DuckDB shaders.