import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StatesmanApiClient } from "../client/index.js";

export function registerCityTools(server: McpServer, client: StatesmanApiClient): void {
  server.tool(
    "list_cities",
    "List and filter strategic urban power centers with civic/economic themes and embedding metadata.",
    {
      country_id: z.number().int().positive().optional().describe("Filter by sovereign country ID"),
      continent_id: z.number().int().positive().optional().describe("Filter by continent ID"),
      theme: z.string().optional().describe("Filter cities containing thematic tag (e.g. 'deepwater port', 'financial hub')"),
      q: z.string().optional().describe("Keyword search across city name, description, or country name"),
      embedded: z.boolean().optional().describe("Filter by whether vector embedding has been generated"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector array"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listCities(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list cities: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_city",
    "Retrieve details of a strategic city including its structured themes and associated country/continent.",
    {
      id: z.number().int().positive().describe("City ID"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-dim vector embedding")
    },
    async ({ id, include_embedding }) => {
      try {
        const city = await client.getCity(id, { include_embedding });
        return {
          content: [{ type: "text", text: JSON.stringify(city, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get city ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_city",
    "Create a new strategic city record associated with a sovereign country.",
    {
      country_id: z.number().int().positive().describe("Country ID"),
      name: z.string().min(1).describe("Name of the city (e.g. 'Marseille', 'Rotterdam')"),
      description: z.string().optional().describe("Description of urban role, economic base, and strategic logistics"),
      themes: z.array(z.string()).optional().describe("Thematic urban tags (e.g. ['deepwater port', 'mediterranean gateway'])")
    },
    async ({ country_id, name, description, themes }) => {
      try {
        const city = await client.createCity({ country_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(city, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create city: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_city",
    "Update an existing city's attributes, country, or thematic tags.",
    {
      id: z.number().int().positive().describe("City ID"),
      name: z.string().optional().describe("Updated city name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated thematic tags"),
      country_id: z.number().int().positive().optional().describe("Reassign to a different country ID")
    },
    async ({ id, name, description, themes, country_id }) => {
      try {
        const city = await client.updateCity(id, { name, description, themes, country_id });
        return {
          content: [{ type: "text", text: JSON.stringify(city, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update city ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_city",
    "Delete a city record.",
    {
      id: z.number().int().positive().describe("City ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteCity(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete city ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_cities_batch",
    "Batch insert or update strategic cities scoped to a specific country.",
    {
      country_id: z.number().int().positive().describe("Country ID"),
      cities: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of cities to upsert")
    },
    async ({ country_id, cities }) => {
      try {
        const result = await client.upsertCitiesBatch(country_id, cities);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to batch upsert cities: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_city_embedding",
    "Calculate 1024-dimensional vector embedding for a city record.",
    {
      id: z.number().int().positive().describe("City ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateCityEmbedding(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for city ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_cities_bulk",
    "Trigger bulk LLM city discovery across all countries or a single country.",
    {
      country_id: z.number().int().positive().optional().describe("Optional country ID to scope discovery"),
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for completion")
    },
    async ({ country_id, sync }) => {
      try {
        const result = await client.populateCities(country_id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to bulk populate cities: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
