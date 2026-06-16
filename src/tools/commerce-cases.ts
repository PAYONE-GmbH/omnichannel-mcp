import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CommerceCaseApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCommerceCaseTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "list_commerce_cases",
        {
            description: "List commerce cases for the configured merchant. Optional JSON query params for filtering.",
            inputSchema: { queryParams: z.string().optional().describe("Optional JSON for GetCommerceCasesQuery filter") },
        },
        async ({ queryParams }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const query = queryParams ? JSON.parse(queryParams) : undefined;
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