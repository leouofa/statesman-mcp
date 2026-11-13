# Changelog

All notable changes to `statesman-mcp` will be documented in this file.

## [1.0.0] - 2026-11-12

### Added
- Initial release of `statesman-mcp` Model Context Protocol (MCP) server for the Statesman `/api/v1` REST API.
- **51 MCP Tools** across 8 modules:
  - **Search & Counterparts**: `search`, `find_counterparts`.
  - **Continents**: `list_continents`, `get_continent`, `create_continent`, `update_continent`, `delete_continent`, `upsert_continents_batch`, `populate_continents`, `populate_continent_countries`.
  - **Countries**: `list_countries`, `get_country`, `create_country`, `update_country`, `delete_country`, `upsert_countries_batch`, `generate_country_embedding`, `populate_country_cities`, `populate_countries_bulk`.
  - **Cities**: `list_cities`, `get_city`, `create_city`, `update_city`, `delete_city`, `upsert_cities_batch`, `generate_city_embedding`, `populate_cities_bulk`.
  - **Clusters & Snapshots**: `compute_clusters`, `create_cluster_snapshot`, `list_cluster_snapshots`, `get_cluster_snapshot`, `delete_cluster_snapshot`, `list_cluster_groups`, `get_cluster_group`.
  - **Synthesis Reports**: `list_cluster_reports`, `get_cluster_report`, `create_cluster_report`, `delete_cluster_report`, `generate_deep_synthesis`, `list_report_summaries`, `get_report_summary`, `list_report_sub_reports`, `get_report_sub_report`.
  - **Background Jobs**: `list_jobs`, `get_job_status`, `wait_for_job`.
  - **System & Settings**: `get_platform_status`, `get_settings`, `update_context_window`, `trigger_bulk_embeddings`, `get_openapi_spec`.
- **4 MCP Resources**: `statesman://status`, `statesman://continents`, `statesman://snapshots/{id}`, `statesman://reports/{id}`.
- **2 Geopolitical Analysis Prompts**: `comparative_statecraft_analysis`, `geopolitical_cluster_synthesis`.
- Typed `StatesmanApiClient` with structured `StatesmanApiError` handling and Vitest test suite.
