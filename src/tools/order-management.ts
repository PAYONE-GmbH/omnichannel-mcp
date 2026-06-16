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
    server.tool(
        "create_order",
        "Create an order for a checkout.",
        { ...scope, body: z.string().describe("JSON body for OrderRequest") },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.createOrder(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.tool(
        "deliver_order",
        "Mark an order as delivered.",
        { ...scope, body: z.string().describe("JSON body for DeliverRequest") },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.deliverOrder(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.tool(
        "return_order",
        "Process a return for an order.",
        { ...scope, body: z.string().optional().describe("Optional JSON body for ReturnRequest") },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.returnOrder(pcpClient.merchantId, commerceCaseId, checkoutId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );

    server.tool(
        "cancel_order",
        "Cancel an order.",
        { ...scope, body: z.string().optional().describe("Optional JSON body for CancelRequest") },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new OrderManagementCheckoutActionsApiClient(pcpClient.config);
            const result = await api.cancelOrder(pcpClient.merchantId, commerceCaseId, checkoutId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );
}