# Third-Party Licenses

This project uses the following third-party libraries and components. Each has its own license terms.

## Core Dependencies

### Database Engines

#### DuckDB-WASM
- **Package**: `@duckdb/duckdb-wasm`
- **License**: MIT License
- **URL**: https://github.com/duckdb/duckdb-wasm
- **Usage**: Browser-based SQL database engine

#### ClickHouse Client
- **Package**: `@clickhouse/client-web`
- **License**: Apache License 2.0
- **URL**: https://github.com/ClickHouse/clickhouse-js
- **Usage**: HTTP client for ClickHouse database

### Data Processing

#### Apache Arrow
- **Package**: `@apache/arrow`
- **License**: Apache License 2.0
- **URL**: https://github.com/apache/arrow
- **Usage**: Columnar data format for efficient data transfer

### Visualization Libraries

#### D3.js
- **Package**: `d3`
- **License**: ISC License
- **URL**: https://github.com/d3/d3
- **Usage**: Data visualization and DOM manipulation

#### D3 Flame Graph
- **Package**: `d3-flame-graph`
- **License**: Apache License 2.0
- **URL**: https://github.com/spiermar/d3-flame-graph
- **Usage**: Performance profiling flamegraph visualization

#### Mermaid
- **Package**: `mermaid`
- **License**: MIT License
- **URL**: https://github.com/mermaid-js/mermaid
- **Usage**: Diagram and flowchart rendering

#### DuckDB Explain Visualizer
- **Package**: `duckdb-explain-visualizer`
- **License**: MIT License
- **URL**: https://github.com/aantakli/duckdb-explain-visualizer
- **Usage**: Interactive visualization of DuckDB query execution plans

#### PEV2 (Postgres Explain Visualizer 2)
- **Package**: `pev2`
- **License**: PostgreSQL License
- **URL**: https://github.com/dalibo/pev2
- **Usage**: Interactive visualization of PostgreSQL-compatible query execution plans (used for DataFusion PGJSON format)
- **Note**: Loaded from CDN at runtime for DataFusion profiler

### UI Frameworks

#### Vue.js 3
- **Package**: `vue`
- **License**: MIT License
- **URL**: https://github.com/vuejs/core
- **Usage**: Progressive JavaScript framework (used by PEV2 visualizer)
- **Note**: Loaded from CDN at runtime for DataFusion profiler

#### Bootstrap 5
- **Package**: `bootstrap`
- **License**: MIT License
- **URL**: https://github.com/twbs/bootstrap
- **Usage**: CSS framework for UI components (required by PEV2)

### Code Editor

#### Vue.js
- **Package**: `vue`
- **Version**: 3.2.45
- **License**: MIT License
- **URL**: https://github.com/vuejs/core
- **Usage**: Used by duckdb-explain-visualizer component

### UI Components

#### CodeMirror
- **Package**: `codemirror`
- **Version**: 5.65.16
- **License**: MIT License
- **URL**: https://github.com/codemirror/codemirror5
- **Source**: CDN (cdnjs.cloudflare.com)
- **Usage**: SQL syntax highlighting and code editor

#### Bootstrap
- **Package**: `bootstrap`
- **Version**: 5.3.2
- **License**: MIT License
- **URL**: https://github.com/twbs/bootstrap
- **Source**: CDN (unpkg.com)
- **Usage**: Modal styling and UI components

### Audio Processing

#### ⚠️ Strudel (AGPL-3.0)

- **Package**: Strudel audio library
- **License**: **GNU Affero General Public License v3.0 (AGPL-3.0)**
- **URL**: https://strudel.cc / https://github.com/tidalcycles/strudel
- **Usage**: Live coding audio patterns and FFT-based audio input for shaders
- **Location**: `src/inputs/strudel_input.js`, loaded from https://strudel.cc

**IMPORTANT LICENSE NOTICE:**

Strudel is licensed under AGPL-3.0, which is a **copyleft license** with network use provisions:
- If you use SQL Shader with Strudel audio features enabled
- AND you modify the Strudel-related code or deploy SQL Shader as a network service
- You MUST make your source code available under AGPL-3.0

**Our Implementation:**
- Strudel is loaded as an optional feature via the "Audio" button
- It is NOT required for core SQL Shader functionality
- The main SQL Shader project (without Strudel) is licensed under Apache 2.0
- Strudel integration code is clearly isolated in `src/inputs/strudel_input.js`

**Your Options:**
1. Use SQL Shader without Strudel audio features → Apache 2.0 applies
2. Use SQL Shader with Strudel → AGPL-3.0 may apply to your modifications
3. Remove Strudel integration → Delete `src/inputs/strudel_input.js` and audio button

For questions about AGPL-3.0 compliance, consult: https://www.gnu.org/licenses/agpl-3.0.html

## CDN Resources

The following resources are loaded from CDNs and not bundled with this project:

- **CodeMirror** (MIT) - https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/
- **Bootstrap** (MIT) - https://unpkg.com/bootstrap@5.3.2/
- **D3 Flame Graph CSS** (Apache 2.0) - https://cdn.jsdelivr.net/npm/d3-flame-graph@4.1.3/

## Utilities

### coi-serviceworker.js
- **Author**: gzuidhof
- **License**: MIT License (assumed, public gist)
- **URL**: https://github.com/gzuidhof/coi-serviceworker
- **Usage**: Cross-Origin Isolation workaround for SharedArrayBuffer support

## Full License Texts

Full license texts for each dependency can be found at:
- Apache License 2.0: http://www.apache.org/licenses/LICENSE-2.0
- MIT License: https://opensource.org/licenses/MIT
- ISC License: https://opensource.org/licenses/ISC
- AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html

## Attribution Requirements

When using SQL Shader, please maintain:
1. This THIRD-PARTY-LICENSES.md file
2. Copyright notices in source files
3. Links to original projects (especially for Strudel AGPL compliance)

## License Compatibility

The Apache 2.0 license is compatible with most other open-source licenses, including:
- MIT, BSD, ISC licenses (permissive)
- Other Apache 2.0 projects

**EXCEPTION**: AGPL-3.0 (Strudel) has special copyleft requirements. See Strudel section above.

---

Last Updated: October 2025
