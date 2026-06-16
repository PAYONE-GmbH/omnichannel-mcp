import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { CommerceCaseApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerCommerceCaseTools(server: McpServer, pcpClient: PcpClient): void {
    server.tool(
        "list_commerce_cases",
        "List commerce cases for the configured merchant. Optional JSON query params for filtering.",
        { queryParams: z.string().optional().describe("Optional JSON for GetCommerceCasesQuery filter") },
        async ({ queryParams }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const query = queryParams ? JSON.parse(queryParams) : undefined;
            const result = await api.getCommerceCasesRequest(pcpClient.merchantId, query);
            return textResult(result);
        },
    );

    server.tool(
        "get_commerce_case",
        "Get a single commerce case by its ID.",
        { commerceCaseId: z.string().describe("The commerce case ID") },
        async ({ commerceCaseId }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const result = await api.getCommerceCaseRequest(pcpClient.merchantId, commerceCaseId);
            return textResult(result);
        },
    );

    server.tool(
        "create_commerce_case",
        "Create a new commerce case.",
        { body: z.string().describe("JSON body for CreateCommerceCaseRequest") },
        async ({ body }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            const result = await api.createCommerceCaseRequest(pcpClient.merchantId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.tool(
        "update_commerce_case",
        "Update (patch) an existing commerce case.",
        {
            commerceCaseId: z.string(),
            body: z.string().describe("JSON body for PatchCommerceCaseRequest"),
        },
        async ({ commerceCaseId, body }) => {
            const api = new CommerceCaseApiClient(pcpClient.config);
            await api.updateCommerceCaseRequest(pcpClient.merchantId, commerceCaseId, JSON.parse(body));
            return textResult({ success: true });
        },
    );
}