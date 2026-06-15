import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AppServiceClient } from "./ws/app-service-client.js";
import { registerShopTools } from "./tools/shops.js";
import { registerTestTools } from "./tools/tests.js";

export function createPatsyMcpServer(appClient: AppServiceClient): McpServer {
    const server = new McpServer({
        name: "patsy",
        version: "26.04-2-SouthStar",
        description:
            "Payone Automated Testing System (Patsy) – Create and manage fully configured Shopping Cart Systems (Shop-Systems) for E2E-Tests." +
            " This MCP server provides tools for shop management, cleanup activities, and testing utilities to facilitate efficient and automated testing workflows.",
    });

    registerShopTools(server, appClient);
    registerTestTools(server, appClient);

    return server;
}