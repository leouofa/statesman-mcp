import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StatesmanApiClient } from "../client/index.js";
import { registerSearchTools } from "./search.js";
import { registerContinentTools } from "./continents.js";
import { registerCountryTools } from "./countries.js";
import { registerCityTools } from "./cities.js";
import { registerClusterTools } from "./clusters.js";
import { registerReportTools } from "./reports.js";
import { registerJobTools } from "./jobs.js";
import { registerSystemTools } from "./system.js";

export function registerAllTools(server: McpServer, client: StatesmanApiClient): void {
  registerSearchTools(server, client);
  registerContinentTools(server, client);
  registerCountryTools(server, client);
  registerCityTools(server, client);
  registerClusterTools(server, client);
  registerReportTools(server, client);
  registerJobTools(server, client);
  registerSystemTools(server, client);
}
