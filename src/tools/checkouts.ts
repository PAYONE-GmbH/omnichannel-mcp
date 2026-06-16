import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CheckoutApiClient } from "pcp-server-nodejs-sdk";
import { buildCheckoutsQuery } from "../pcp/query-builder.js";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCheckoutTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "list_checkouts",
        {
            description:
                "List checkouts for the configured merchant with optional filters. " +
                "All parameters are optional. Use 'size' to limit results.",
            inputSchema: {
                offset: z.number().optional().describe("Pagination offset (0-based)"),
                size: z.number().optional().describe("Max number of results to return"),
                fromDate: z.string().optional().describe("Start date filter (ISO 8601)"),
                toDate: z.string().optional().describe("End date filter (ISO 8601)"),
                checkoutId: z.string().optional().describe("Filter by checkout ID"),
                merchantReference: z.string().optional().describe("Filter by merchant reference"),
                merchantCustomerId: z.string().optional().describe("Filter by merchant customer ID"),
                paymentReference: z.string().optional().describe("Filter by payment reference"),
                paymentId: z.string().optional().describe("Filter by payment ID"),
                firstName: z.string().optional().describe("Filter by customer first name"),
                surname: z.string().optional().describe("Filter by customer surname"),
                email: z.string().optional().describe("Filter by customer email"),
                includeCheckoutStatus: z.array(z.string()).optional().describe("Filter by checkout statuses"),
                includePaymentChannel: z.array(z.string()).optional().describe("Filter by payment channels"),
            },
        },
        async (params) => {
            const api = new CheckoutApiClient(pcpClient.config);
            const hasFilters = Object.values(params).some((v) => v !== undefined);
            const query = hasFilters ? buildCheckoutsQuery(params) : undefined;
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