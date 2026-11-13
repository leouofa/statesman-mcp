# Statesman Model Context Protocol (MCP) Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%2B-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.x-orange.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server interfacing with the **[Statesman](https://github.com/leouofa/statesman)** computational laboratory for comparative geopolitics, statecraft, and urban power centers (`/api/v1` REST API).

Statesman MCP allows AI agents (in Antigravity, Claude Desktop, Cursor, and custom agent harnesses) to seamlessly navigate, search, cluster, and synthesize cross-continental geopolitical catalogs, 1024-dimensional `pgvector` cosine distance manifolds, and multi-stage LLM synthesis monographs.

---

## Capabilities Overview

```
                      +---------------------------------------+
                      | AI Agent (Claude, Antigravity, etc.)  |
                      +-------------------+-------------------+
                                          |
                                    stdio | JSON-RPC
                                          v
                      +---------------------------------------+
                      |       Statesman MCP Server            |
                      |   - 51 Tools (Search, CRUD, ML)       |
                      |   - 4 Resources (Status, Reports)     |
                      |   - 2 Geopolitical Analysis Prompts   |
                      +-------------------+-------------------+
                                          |
                                     HTTP | REST (/api/v1)
                                          v
                      +---------------------------------------+
                      |         Statesman API (Rails)         |
                      |   - pgvector 1024-dim Manifold        |
                      |   - Connected-Components Clustering   |
                      |   - Multi-phase Synthesis Engine      |
                      +---------------------------------------+
```

### 1. Global Search & Manifold Traversal
- **`search`**: Unified semantic (`pgvector`) or keyword search across sovereign countries and strategic cities.
- **`find_counterparts`**: Identifies nearest structural geopolitical or urban counterparts to any country or city using 1024-dimensional vector cosine distance (with optional continent or country scoping).

### 2. Geopolitical & Urban Catalog Management (CRUD)
- **Continents (8 tools)**: `list_continents`, `get_continent`, `create_continent`, `update_continent`, `delete_continent`, `upsert_continents_batch`, `populate_continents`, `populate_continent_countries`.
- **Countries (9 tools)**: `list_countries`, `get_country`, `create_country`, `update_country`, `delete_country`, `upsert_countries_batch`, `generate_country_embedding`, `populate_country_cities`, `populate_countries_bulk`.
- **Cities (8 tools)**: `list_cities`, `get_city`, `create_city`, `update_city`, `delete_city`, `upsert_cities_batch`, `generate_city_embedding`, `populate_cities_bulk`.

### 3. Archetype Clustering & Snapshots (7 tools)
- **`compute_clusters`**: Dynamically calculates connected-components vector clusters across `Country` or `City` manifolds with configurable granularity levels (1–15) and zero-singleton `full_coverage` absorption without modifying the database.
- **`create_cluster_snapshot`**: Computes and freezes clustering into an immutable database snapshot.
- **`list_cluster_snapshots`**, **`get_cluster_snapshot`**, **`delete_cluster_snapshot`**, **`list_cluster_groups`**, **`get_cluster_group`**.

### 4. Scholarly Synthesis Monograph Reports (9 tools)
- **`create_cluster_report`**: Triggers a 2-Phase Map-Reduce synthesis report on a snapshot with a custom geopolitical or urban research inquiry.
- **`generate_deep_synthesis`**: Initiates a 3-Phase Hierarchical Deep Synthesis monograph, grouping Phase 1 summaries into intermediate batch analyses.
- **`list_cluster_reports`**, **`get_cluster_report`**, **`delete_cluster_report`**, **`list_report_summaries`**, **`get_report_summary`**, **`list_report_sub_reports`**, **`get_report_sub_report`**.

### 5. Background Jobs & Execution Control (3 tools)
- **`get_job_status`**, **`list_jobs`**: Inspect ActiveJob/Sidekiq lifecycle states.
- **`wait_for_job`**: Polls asynchronous operations until completion or failure with configurable intervals and timeouts.

### 6. System & Settings (5 tools)
- **`get_platform_status`**: Platform health, entity counts (`continents`, `countries`, `cities`), embedding coverage stats, and active LLM configuration.
- **`get_settings`**, **`update_context_window`**, **`trigger_bulk_embeddings`**, **`get_openapi_spec`**.

---

## MCP Resources

Directly inspectable URIs that AI agents can mount into context:
- `statesman://status`: Platform health, entity metrics, and active LLM/embedding models.
- `statesman://continents`: Catalog overview of all registered continents and sovereign country counts.
- `statesman://snapshots/{id}`: Detailed cluster groups and member states/cities of a frozen snapshot.
- `statesman://reports/{id}`: Full compiled markdown text of a scholarly synthesis monograph.

---

## Comparative Geopolitics Prompts

- `comparative_statecraft_analysis`: Structured inquiry comparing two sovereign countries or strategic cities across continents using statecraft themes and semantic similarity.
- `geopolitical_cluster_synthesis`: Guides the model to draft an academic monograph based on frozen cluster snapshots.

---

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- A running Statesman instance (default: `http://localhost:3000/api/v1`)

### 1. Build from Source
```bash
git clone https://github.com/leouofa/statesman-mcp.git
cd statesman-mcp
npm install
npm run build
```

### 2. Environment Configuration
Create a `.env` file or export environment variables:
```bash
STATESMAN_API_URL=http://localhost:3000/api/v1
# STATESMAN_API_KEY=your_optional_token
STATESMAN_TIMEOUT_MS=60000
```

---

## Client Integration Examples

### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "statesman": {
      "command": "node",
      "args": [
        "/absolute/path/to/statesman-mcp/dist/index.js"
      ],
      "env": {
        "STATESMAN_API_URL": "http://localhost:3000/api/v1"
      }
    }
  }
}
```

### Antigravity / Gemini CLI / Cursor
Add to your client configuration:
```json
{
  "mcpServers": {
    "statesman": {
      "command": "npx",
      "args": ["-y", "tsx", "/absolute/path/to/statesman-mcp/src/index.ts"],
      "env": {
        "STATESMAN_API_URL": "http://localhost:3000/api/v1"
      }
    }
  }
}
```

---

## CLI Options

```
Usage:
  statesman-mcp [options]

Options:
  -u, --url <url>        Statesman API base URL (default: http://localhost:3000/api/v1)
  -k, --api-key <key>    Optional API key / Bearer token
  -t, --timeout <ms>     Request timeout in milliseconds (default: 60000)
  -h, --help             Display help message
```

---

## Development & Testing

```bash
# Run unit and integration test suite
npm test

# Run tests in watch mode
npm run test:watch

# Compile TypeScript
npm run build

# Start server directly in development
npm run dev
```

---

## License

MIT © [Leonid Medovyy](https://github.com/leouofa)
