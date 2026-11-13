import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StatesmanApiClient } from "../client/index.js";

export function registerSearchTools(server: McpServer, client: StatesmanApiClient): void {
  server.tool(
    "search",
    "Unified cross-catalog semantic or keyword search across sovereign countries and strategic cities in the Statesman comparative geopolitics manifold.",
    {
      q: z.string().describe("Search query text (e.g. 'maritime chokepoint gateway', 'sovereign wealth fund industrial policy')"),
      mode: z.enum(["semantic", "keyword", "auto"]).optional().default("auto").describe("Search mode: semantic (pgvector cosine similarity), keyword (text matching), or auto"),
      target_type: z.enum(["all", "country", "city"]).optional().default("all").describe("Filter search results by entity type: all, country, or city"),
      limit: z.number().int().min(1).max(100).optional().default(20).describe("Maximum number of results to return (1-100)")
    },
    async ({ q, mode, target_type, limit }) => {
      try {
        const results = await client.search({ q, mode, target_type, limit });
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Search failed: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "find_counterparts",
    "Find nearest geopolitical or urban counterparts to a specified country or city using 1024-dimensional pgvector cosine distance.",
    {
      entity_type: z.enum(["country", "city"]).describe("Entity type to find counterparts for: country or city"),
      id: z.number().int().positive().describe("ID of the country or city"),
      limit: z.number().int().min(1).max(100).optional().default(10).describe("Number of nearest neighbors to return (default: 10)"),
      continent_id: z.number().int().positive().optional().describe("Optional continent ID to filter counterpart candidates"),
      country_id: z.number().int().positive().optional().describe("Optional country ID to filter counterpart candidates (for city counterparts)"),
      include_embedding: z.boolean().optional().default(false).describe("Whether to include raw 1024-float vector embeddings in results")
    },
    async ({ entity_type, id, limit, continent_id, country_id, include_embedding }) => {
      try {
        if (entity_type === "country") {
          const neighbors = await client.getCountryNeighbors(id, { limit, continent_id, include_embedding });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        } else {
          const neighbors = await client.getCityNeighbors(id, { limit, country_id, continent_id, include_embedding });
          return {
            content: [{ type: "text", text: JSON.stringify(neighbors, null, 2) }]
          };
        }
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Finding counterparts failed: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
