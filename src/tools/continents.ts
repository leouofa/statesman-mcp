import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StatesmanApiClient } from "../client/index.js";

export function registerContinentTools(server: McpServer, client: StatesmanApiClient): void {
  server.tool(
    "list_continents",
    "List world continents registered in Statesman with sovereign country counts.",
    {
      q: z.string().optional().describe("Filter continents by name or description substring"),
      include_countries: z.boolean().optional().default(false).describe("Include sovereign countries associated with each continent"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async ({ q, include_countries, limit, offset }) => {
      try {
        const result = await client.listContinents({ q, include_countries, limit, offset });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list continents: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_continent",
    "Retrieve details of a single continent including its sovereign countries.",
    {
      id: z.number().int().positive().describe("Continent ID"),
      include_countries: z.boolean().optional().default(true).describe("Include sovereign countries belonging to this continent")
    },
    async ({ id, include_countries }) => {
      try {
        const continent = await client.getContinent(id, { include_countries });
        return {
          content: [{ type: "text", text: JSON.stringify(continent, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get continent ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_continent",
    "Create a new continent record in the catalog.",
    {
      name: z.string().min(1).describe("Name of the continent (e.g. 'Europe', 'Asia')"),
      description: z.string().optional().describe("Geopolitical, institutional, and macro-regional description")
    },
    async ({ name, description }) => {
      try {
        const continent = await client.createContinent({ name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(continent, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create continent: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_continent",
    "Update an existing continent's name or description.",
    {
      id: z.number().int().positive().describe("Continent ID"),
      name: z.string().optional().describe("Updated continent name"),
      description: z.string().optional().describe("Updated description")
    },
    async ({ id, name, description }) => {
      try {
        const continent = await client.updateContinent(id, { name, description });
        return {
          content: [{ type: "text", text: JSON.stringify(continent, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update continent ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_continent",
    "Delete a continent and its cascaded countries and cities.",
    {
      id: z.number().int().positive().describe("Continent ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteContinent(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete continent ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_continents_batch",
    "Batch insert or update continents matching case-insensitively on name.",
    {
      continents: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional()
          })
        )
        .min(1)
        .describe("Array of continents to upsert")
    },
    async ({ continents }) => {
      try {
        const result = await client.upsertContinentsBatch(continents);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to upsert continents: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_continents",
    "Trigger LLM discovery to populate all 7 standard continents with geopolitical descriptions.",
    {
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for discovery to complete")
    },
    async ({ sync }) => {
      try {
        const result = await client.populateContinents(sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate continents: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_continent_countries",
    "Discover and populate sovereign countries for a specific continent via LLM generation.",
    {
      id: z.number().int().positive().describe("Continent ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for country discovery to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.populateContinentCountries(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate countries for continent ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
