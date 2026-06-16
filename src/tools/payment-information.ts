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
    server.tool(
        "create_payment_information",
        "Create payment information for a checkout.",
        { ...scope, body: z.string().describe("JSON body for PaymentInformationRequest") },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.createPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.tool(
        "get_payment_information",
        "Get payment information by ID.",
        { ...scope, paymentInformationId: z.string() },
        async ({ commerceCaseId, checkoutId, paymentInformationId }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.getPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, paymentInformationId);
            return textResult(result);
        },
    );

    server.tool(
        "refund_payment_information",
        "Refund via payment information.",
        { ...scope, paymentInformationId: z.string(), body: z.string().describe("JSON body for PaymentInformationRefundRequest") },
        async ({ commerceCaseId, checkoutId, paymentInformationId, body }) => {
            const api = new PaymentInformationApiClient(pcpClient.config);
            const result = await api.refundPaymentInformation(pcpClient.merchantId, commerceCaseId, checkoutId, paymentInformationId, JSON.parse(body));
            return textResult(result);
        },
    );
}