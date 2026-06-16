import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { OrderManagementCheckoutActionsApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const scope = {
    commerceCaseId: z.string(),
    checkoutId: z.string(),
};

export function registerOrderManagementTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "create_order",
        {
            description: "Create an order for a checkout.",
            inputSchema: { ...scope, body: z.string().describe("JSON body for OrderRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.createOrder(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "deliver_order",
        {
            description: "Mark an order as delivered.",
            inputSchema: { ...scope, body: z.string().describe("JSON body for DeliverRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.deliverOrder(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "return_order",
        {
            description: "Process a return for an order.",
            inputSchema: { ...scope, body: z.string().optional().describe("Optional JSON body for ReturnRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.returnOrder(pcpClient.merchantId, commerceCaseId, checkoutId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );

    server.registerTool(
        "cancel_order",
        {
            description: "Cancel an order.",
            inputSchema: { ...scope, body: z.string().optional().describe("Optional JSON body for CancelRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.cancelOrder(pcpClient.merchantId, commerceCaseId, checkoutId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );
}