import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CheckoutApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCheckoutTools(server: McpServer, pcpClient: PcpClient): void {
    server.tool(
        "list_checkouts",
        "List checkouts for the configured merchant. Optional JSON query params for filtering.",
        { queryParams: z.string().optional().describe("Optional JSON for GetCheckoutsQuery filter") },
        async ({ queryParams }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const query = queryParams ? JSON.parse(queryParams) : undefined;
            const result = await api.getCheckoutsRequest(pcpClient.merchantId, query);
            return textResult(result);
        },
    );

    server.tool(
        "get_checkout",
        "Get a checkout by commerce case ID and checkout ID.",
        {
            commerceCaseId: z.string(),
            checkoutId: z.string(),
        },
        async ({ commerceCaseId, checkoutId }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.getCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId);
            return textResult(result);
        },
    );

    server.tool(
        "create_checkout",
        "Create a new checkout within a commerce case.",
        {
            commerceCaseId: z.string(),
            body: z.string().describe("JSON body for CreateCheckoutRequest"),
        },
        async ({ commerceCaseId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.createCheckoutRequest(pcpClient.merchantId, commerceCaseId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.tool(
        "update_checkout",
        "Update (patch) an existing checkout.",
        {
            commerceCaseId: z.string(),
            checkoutId: z.string(),
            body: z.string().describe("JSON body for PatchCheckoutRequest"),
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            await api.updateCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult({ success: true });
        },
    );

    server.tool(
        "remove_checkout",
        "Remove/delete a checkout.",
        {
            commerceCaseId: z.string(),
            checkoutId: z.string(),
        },
        async ({ commerceCaseId, checkoutId }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            await api.removeCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId);
            return textResult({ success: true });
        },
    );

    server.tool(
        "complete_checkout",
        "Complete a checkout (finalize order).",
        {
            commerceCaseId: z.string(),
            checkoutId: z.string(),
            body: z.string().describe("JSON body for CompleteOrderRequest"),
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const result = await api.completeCheckoutRequest(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );
}