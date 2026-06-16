import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CheckoutApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCheckoutTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "list_checkouts",
        {
            description: "List checkouts for the configured merchant. Optional JSON query params for filtering.",
            inputSchema: { queryParams: z.string().optional().describe("Optional JSON for GetCheckoutsQuery filter") },
        },
        async ({ queryParams }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const query = queryParams ? JSON.parse(queryParams) : undefined;
            const result = await api.getCheckoutsRequest(pcpClient.merchantId, query);
            return textResult(result);
        },
    );

    server.registerTool(
        "get_checkout",
        {
            description: "Get a checkout by commerce case ID and checkout ID.",
            inputSchema: {
                commerceCaseId: z.string(),
                checkoutId: z.string(),
            },
        },
        async ({ commerceCaseId, checkoutId }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.getCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId);
            return textResult(result);
        },
    );

    server.registerTool(
        "create_checkout",
        {
            description: "Create a new checkout within a commerce case.",
            inputSchema: {
                commerceCaseId: z.string(),
                body: z.string().describe("JSON body for CreateCheckoutRequest"),
            },
        },
        async ({ commerceCaseId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.createCheckoutRequest(pcpClient.merchantId, commerceCaseId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "update_checkout",
        {
            description: "Update (patch) an existing checkout.",
            inputSchema: {
                commerceCaseId: z.string(),
                checkoutId: z.string(),
                body: z.string().describe("JSON body for PatchCheckoutRequest"),
            },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            await api.updateCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult({ success: true });
        },
    );

    server.registerTool(
        "remove_checkout",
        {
            description: "Remove/delete a checkout.",
            inputSchema: {
                commerceCaseId: z.string(),
                checkoutId: z.string(),
            },
        },
        async ({ commerceCaseId, checkoutId }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            await api.removeCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId);
            return textResult({ success: true });
        },
    );

    server.registerTool(
        "complete_checkout",
        {
            description: "Complete a checkout (finalize order).",
            inputSchema: {
                commerceCaseId: z.string(),
                checkoutId: z.string(),
                body: z.string().describe("JSON body for CompleteOrderRequest"),
            },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.completeCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );
}