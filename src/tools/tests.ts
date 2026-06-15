import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AppServiceClient } from "../ws/app-service-client.js";

export function registerTestTools(server: McpServer, appClient: AppServiceClient) {
    server.tool(
        "get-test-cases",
        "Lists all available test cases for a certain shop.",
        { shopId: z.number().describe("The numeric ID of the Shop-Instance") },
        async ({ shopId }) => {
            const message = await appClient.sendAction("shop.get_test_cases", { shop_id: shopId });
            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data, null, 2) }],
            };
        }
    );

    server.tool(
        "create-test-run",
        "Runs a certain test case for a shop instance. Provide the shop ID and the name of the test case to run.",
        {
            shopId: z.number().describe("The numeric ID of the Shop-Instance"),
            testCaseName: z.string().describe("The name of the test case to run. Use 'get-test-cases' tool to get the list of available test cases for a shop."),
        },
        async ({ shopId, testCaseName }) => {
            console.debug(`Invoking tool: create-test-run with shopId=${shopId} and testCaseName=${testCaseName}`);
            // use default user for now
            const defaultData = {"custom_fields": {"customer_name": "default"}}

            const message = await appClient.sendAction(
                "test_run.create_test_run",
                { shop_id: shopId, test_case_name: testCaseName, data: defaultData }
            );

            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data, null, 2) }],
            };
        }
    );

    server.tool(
        "get-test-plans",
        "Lists all Test-Plans for a certain Shop-Instance.",
        { shopId: z.number().describe("The numeric ID of the Shop-Instance") },
        async ({ shopId }) => {
            const message = await appClient.sendAction("shop.get_test_plans", { shop_id: shopId });
            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data) }],
            };
        }
    );

    server.tool(
        "get-test-plan",
        "Shows details for a certain Test-Plan.",
        { planId: z.number().describe("The numeric ID of Test-Plan") },
        async ({ planId }) => {
            const message = await appClient.sendAction("shop.get_test_plan", { plan_id: planId });
            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data, null, 2) }],
            };
        }
    );

    server.tool(
        "get-test-logs",
        "Calls for the logs of a certain task.",
        { taskId: z.number().describe("The numeric Task-ID") },
        async ({ taskId }) => {
            const message = await appClient.sendAction("task.get_logs", {
                task_id: taskId,
                force_test_service: true,
            });
            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data.logs, null, 2) }],
            };
        }
    );
}