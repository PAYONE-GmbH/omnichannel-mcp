import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PcpClient } from "../pcp/client.js";
import { PaymentExecutionApiClient } from "pcp-server-nodejs-sdk";

function textResult(data: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const checkoutScope = {
    commerceCaseId: z.string(),
    checkoutId: z.string(),
};

const paymentScope = {
    ...checkoutScope,
    paymentExecutionId: z.string(),
};

export function registerPaymentTools(server: McpServer, pcpClient: PcpClient): void {
    server.registerTool(
        "create_payment",
        {
            description: "Create a payment execution for a checkout.",
            inputSchema: { ...checkoutScope, body: z.string().describe("JSON body for PaymentExecutionRequest") },
        },
        async ({ commerceCaseId, checkoutId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.createPayment(pcpClient.merchantId, commerceCaseId, checkoutId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "capture_payment",
        {
            description: "Capture a previously authorized payment.",
            inputSchema: { ...paymentScope, body: z.string().describe("JSON body for CapturePaymentRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.capturePayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "cancel_payment",
        {
            description: "Cancel a payment execution.",
            inputSchema: { ...paymentScope, body: z.string().describe("JSON body for CancelPaymentRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.cancelPayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "refund_payment",
        {
            description: "Refund a payment execution.",
            inputSchema: { ...paymentScope, body: z.string().describe("JSON body for RefundRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.refundPayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "complete_payment",
        {
            description: "Complete a payment that requires additional steps.",
            inputSchema: { ...paymentScope, body: z.string().describe("JSON body for CompletePaymentRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.completePayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, JSON.parse(body));
            return textResult(result);
        },
    );

    server.registerTool(
        "pause_payment",
        {
            description: "Pause a payment execution.",
            inputSchema: { ...paymentScope, body: z.string().optional().describe("Optional JSON body for PausePaymentRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.pausePayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );

    server.registerTool(
        "refresh_payment",
        {
            description: "Refresh a payment execution status.",
            inputSchema: { ...paymentScope, body: z.string().optional().describe("Optional JSON body for RefreshPaymentRequest") },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.refreshPayment(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, body ? JSON.parse(body) : undefined);
            return textResult(result);
        },
    );

    server.registerTool(
        "create_fund_split",
        {
            description: "Create a fund split for a payment event.",
            inputSchema: {
                ...paymentScope,
                eventId: z.string(),
                body: z.string().describe("JSON body for FundSplitRequest"),
            },
        },
        async ({ commerceCaseId, checkoutId, paymentExecutionId, eventId, body }) => {
            const api = new PaymentExecutionApiClient(pcpClient.config);
            const result = await api.createFundSplit(pcpClient.merchantId, commerceCaseId, checkoutId, paymentExecutionId, eventId, JSON.parse(body));
            return textResult(result);
        },
    );
}