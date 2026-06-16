import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PcpClient } from "./pcp/client.js";
import { registerCommerceCaseTools } from "./tools/commerce-cases.js";
import { registerCheckoutTools } from "./tools/checkouts.js";
import { registerPaymentTools } from "./tools/payments.js";
import { registerOrderManagementTools } from "./tools/order-management.js";
import { registerPaymentInformationTools } from "./tools/payment-information.js";

export function createPcpMcpServer(pcpClient: PcpClient): McpServer {
    const server = new McpServer({
        name: "pcp",
        version: "1.0.0",
        description:
            "PAYONE Commerce Platform (PCP) MCP Server – " +
            "AI interface for the PCP Node.js SDK. " +
            "Provides tools for managing Commerce Cases, Checkouts, Order Management, Payments, and Payment Information.",
    });

    registerCommerceCaseTools(server, pcpClient);
    registerCheckoutTools(server, pcpClient);
    registerPaymentTools(server, pcpClient);
    registerOrderManagementTools(server, pcpClient);
    registerPaymentInformationTools(server, pcpClient);

    return server;
}