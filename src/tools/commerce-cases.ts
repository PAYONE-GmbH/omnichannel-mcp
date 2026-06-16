import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CommerceCaseApiClient } from "pcp-server-nodejs-sdk";
import { buildCommerceCasesQuery } from "../pcp/query-builder.js";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCommerceCaseTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "list_commerce_cases",
        {
            description:
                "List commerce cases for the configured merchant with optional filters. " +
                "All parameters are optional. Use 'size' to limit results (default returns all). " +
                "To find a specific commerce case by ID, prefer 'get_commerce_case' instead.",
            inputSchema: {
                offset: z.number().optional().describe("Pagination offset (0-based)"),
                size: z.number().optional().describe("Max number of results to return"),
                fromDate: z.string().optional().describe("Start date filter (ISO 8601, e.g. 2025-01-01T00:00:00Z)"),
                toDate: z.string().optional().describe("End date filter (ISO 8601)"),
                commerceCaseId: z.string().optional().describe("Filter by commerce case ID"),
                merchantReference: z.string().optional().describe("Filter by merchant reference"),
                merchantCustomerId: z.string().optional().describe("Filter by merchant customer ID"),
                includeCheckoutStatus: z.array(z.string()).optional().describe("Filter by checkout statuses (e.g. OPEN, COMPLETED, CANCELLED)"),
                includePaymentChannel: z.array(z.string()).optional().describe("Filter by payment channels (e.g. ECOMMERCE, POS)"),
            },
        },
        async (params) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const hasFilters = Object.values(params).some((v) => v !== undefined);
            const query = hasFilters ? buildCommerceCasesQuery(params) : undefined;
            const result = await api.getCommerceCasesRequest(pcpClient.merchantId, query);
            return textResult(result);
        },
    );

    server.registerTool(
        "get_commerce_case",
        {
            description: "Get a single commerce case by its ID.",
            inputSchema: { commerceCaseId: z.string().describe("The commerce case ID") },
        },
        async ({ commerceCaseId }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const result = await api.getCommerceCaseRequest(pcpClient.merchantId, commerceCaseId);
            return textResult(result);
        },
    );

    server.registerTool(
        "create_commerce_case",
        {
            description: "Create a new commerce case.",
            inputSchema: { body: z.string().describe("JSON body for CreateCommerceCaseRequest") },
        },
        async ({ body }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const result = await api.createCommerceCaseRequest(pcpClient.merchantId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "update_commerce_case",
        {
            description: "Update (patch) an existing commerce case.",
            inputSchema: {
                commerceCaseId: z.string(),
                body: z.string().describe("JSON body for PatchCommerceCaseRequest"),
            },
        },
        async ({ commerceCaseId, body }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            await api.updateCommerceCaseRequest(pcpClient.merchantId, commerceCaseId, JSON.parse(body));
            return textResult({ success: true });
        },
    );
}