import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StatesmanApiClient } from "../client/index.js";

export function registerCountryTools(server: McpServer, client: StatesmanApiClient): void {
  server.tool(
    "list_countries",
    "List and filter sovereign countries with statecraft themes, city counts, and vector embedding status.",
    {
      continent_id: z.number().int().positive().optional().describe("Filter by continent ID"),
      continent: z.string().optional().describe("Filter by continent name substring (e.g. 'Europe')"),
      theme: z.string().optional().describe("Filter countries containing thematic tag (e.g. 'maritime', 'federal')"),
      q: z.string().optional().describe("Search country name or description substring"),
      embedded: z.boolean().optional().describe("Filter by whether vector embedding has been generated"),
      include_cities: z.boolean().optional().default(false).describe("Include associated strategic cities"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-float vector array"),
      limit: z.number().int().min(1).max(500).optional().default(50).describe("Pagination limit (default: 50)"),
      offset: z.number().int().min(0).optional().default(0).describe("Pagination offset (default: 0)")
    },
    async (params) => {
      try {
        const result = await client.listCountries(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to list countries: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "get_country",
    "Retrieve full profile of a sovereign country including continent, thematic statecraft tags, and strategic cities.",
    {
      id: z.number().int().positive().describe("Country ID"),
      include_cities: z.boolean().optional().default(true).describe("Include strategic cities belonging to this country"),
      include_embedding: z.boolean().optional().default(false).describe("Include raw 1024-dim vector embedding")
    },
    async ({ id, include_cities, include_embedding }) => {
      try {
        const country = await client.getCountry(id, { include_cities, include_embedding });
        return {
          content: [{ type: "text", text: JSON.stringify(country, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to get country ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "create_country",
    "Create a new sovereign country record associated with a continent.",
    {
      continent_id: z.number().int().positive().describe("Continent ID"),
      name: z.string().min(1).describe("Name of the sovereign country (e.g. 'Japan', 'France')"),
      description: z.string().optional().describe("Scholarly description of governance, strategic geography, and political economy"),
      themes: z.array(z.string()).optional().describe("Thematic statecraft tags (e.g. ['island', 'tech', 'maritime trade'])")
    },
    async ({ continent_id, name, description, themes }) => {
      try {
        const country = await client.createCountry({ continent_id, name, description, themes });
        return {
          content: [{ type: "text", text: JSON.stringify(country, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create country: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "update_country",
    "Update an existing country's attributes, continent, or thematic tags.",
    {
      id: z.number().int().positive().describe("Country ID"),
      name: z.string().optional().describe("Updated country name"),
      description: z.string().optional().describe("Updated description"),
      themes: z.array(z.string()).optional().describe("Updated thematic tags"),
      continent_id: z.number().int().positive().optional().describe("Reassign to a different continent ID")
    },
    async ({ id, name, description, themes, continent_id }) => {
      try {
        const country = await client.updateCountry(id, { name, description, themes, continent_id });
        return {
          content: [{ type: "text", text: JSON.stringify(country, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to update country ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "delete_country",
    "Delete a country and its cascaded strategic cities.",
    {
      id: z.number().int().positive().describe("Country ID to delete")
    },
    async ({ id }) => {
      try {
        const res = await client.deleteCountry(id);
        return {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to delete country ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "upsert_countries_batch",
    "Batch insert or update sovereign countries scoped to a specific continent.",
    {
      continent_id: z.number().int().positive().describe("Continent ID"),
      countries: z
        .array(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            themes: z.array(z.string()).optional()
          })
        )
        .min(1)
        .describe("Array of countries to upsert")
    },
    async ({ continent_id, countries }) => {
      try {
        const result = await client.upsertCountriesBatch(continent_id, countries);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to batch upsert countries: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "generate_country_embedding",
    "Calculate 1024-dimensional vector embedding for a country using the configured embedding model.",
    {
      id: z.number().int().positive().describe("Country ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for embedding generation to finish")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.generateCountryEmbedding(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to generate embedding for country ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_country_cities",
    "Discover and generate 8-10 strategic cities for a country via LLM extraction.",
    {
      id: z.number().int().positive().describe("Country ID"),
      sync: z.boolean().optional().default(true).describe("If true, wait synchronously for city discovery to complete")
    },
    async ({ id, sync }) => {
      try {
        const result = await client.populateCountryCities(id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate cities for country ${id}: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    "populate_countries_bulk",
    "Trigger bulk LLM country discovery across all continents or a single continent.",
    {
      continent_id: z.number().int().positive().optional().describe("Optional continent ID to scope bulk discovery"),
      sync: z.boolean().optional().default(false).describe("If true, wait synchronously for completion")
    },
    async ({ continent_id, sync }) => {
      try {
        const result = await client.populateCountries(continent_id, sync);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to populate countries in bulk: ${err.message || String(err)}` }]
        };
      }
    }
  );
}
