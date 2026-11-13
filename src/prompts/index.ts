import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "comparative_statecraft_analysis",
    "Prompt template for comparing two sovereign countries or strategic cities across continents using statecraft attributes, urban power networks, and semantic manifold distance.",
    {
      entity_a: z.string().describe("First country or city name (e.g. 'Japan' or 'Rotterdam')"),
      entity_b: z.string().describe("Second country or city name (e.g. 'United Kingdom' or 'Busan')"),
      entity_type: z
        .enum(["country", "city"])
        .optional()
        .default("country")
        .describe("Entity type to compare: country or city (default: country)"),
      focus_theme: z
        .string()
        .optional()
        .describe("Optional thematic lens (e.g. 'maritime gateway logistics', 'developmental statecraft', 'sovereign wealth funds')")
    },
    ({ entity_a, entity_b, entity_type = "country", focus_theme }) => {
      const themeInstruction = focus_theme
        ? `Focus specifically through the thematic lens of: "${focus_theme}".`
        : "Analyze shared institutional trajectories, strategic geography, political-economic functions, and structural archetype convergence.";

      const detailTool = entity_type === "city" ? "get_city" : "get_country";

      return {
        description: `Comparative statecraft analysis of ${entity_a} vs. ${entity_b}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Please conduct a rigorous comparative geopolitics and statecraft analysis between ${entity_a} and ${entity_b} (${entity_type}) using the Statesman computational framework.\n\n` +
                `1. Query Statesman using the 'search' and '${detailTool}' tools to retrieve their structured profiles, thematic tags, and urban/national context.\n` +
                `2. Use 'find_counterparts' (entity_type='${entity_type}') to examine where each falls on the 1024-dimensional pgvector cosine distance manifold.\n` +
                `3. ${themeInstruction}\n` +
                `4. Cite specific thematic tags, strategic cities, cosine distances, and cross-continental institutional parallels.`
            }
          }
        ]
      };
    }
  );

  server.prompt(
    "geopolitical_cluster_synthesis",
    "Prompt template to draft an academic geopolitical treatise based on Statesman archetype clusters and frozen snapshots.",
    {
      snapshot_id: z.string().describe("ID of the frozen cluster snapshot to synthesize"),
      thematic_prompt: z.string().describe("Geopolitical or urban research inquiry to address")
    },
    ({ snapshot_id, thematic_prompt }) => {
      return {
        description: `Geopolitical synthesis based on Snapshot #${snapshot_id}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `You are an expert scholar of comparative politics, international relations, and urban economic geography.\n\n` +
                `Research Inquiry: "${thematic_prompt}"\n\n` +
                `1. Inspect cluster snapshot #${snapshot_id} using 'get_cluster_snapshot' or resource 'statesman://snapshots/${snapshot_id}'.\n` +
                `2. Examine the discovered archetype cluster groups, shared themes, and constituent countries or cities.\n` +
                `3. Check if any synthesis reports exist via 'list_cluster_reports' or initiate a new report via 'create_cluster_report' (and optionally 'generate_deep_synthesis').\n` +
                `4. Compose an academic monograph synthesizing the cross-continental patterns with formal citations to cluster numbers and member states/cities.`
            }
          }
        ]
      };
    }
  );
}
