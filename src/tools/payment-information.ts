import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { PaymentInformationApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const scope = {
    commerceCaseId: z.string(),
    checkoutId: z.string(),
};

export function registerPaymentInformationTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "create_payment_information",
        {
            description: "Create payment information for a checkout.",
            inputSchema: { ...scope, body: z.string().describe("JSON body for PaymentInformationRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.createPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "get_payment_information",
        {
            description: "Get payment information by ID.",
            inputSchema: { ...scope, paymentInformationId: z.string() },
        },
        async ({ commerceCaseId, checkoutId, paymentInformationId }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.getPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, paymentInformationId);
            return textResult(result);
        },
    );

    server.registerTool(
        "refund_payment_information",
        {
            description: "Refund via payment information.",
            inputSchema: { ...scope, paymentInformationId: z.string(), body: z.string().describe("JSON body for PaymentInformationRefundRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentInformationId, body }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.refundPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, paymentInformationId, JSON.parse(body));
            return textResult(result);
        },
    );
}