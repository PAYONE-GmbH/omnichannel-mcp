import { AppServiceError } from "../ws/app-service-client.js";

type McpToolResult = {
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
};

export async function safeCall(
    fn: () => Promise<McpToolResult>
): Promise<McpToolResult> {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof AppServiceError) {
            return {
                content: [{ type: "text", text: `Error [${error.code}]: ${error.message}` }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: `Unexpected Error: ${String(error)}` }],
            isError: true,
        };
    }
}