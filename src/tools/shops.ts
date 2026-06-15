import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AppServiceClient } from "../ws/app-service-client.js";
import {customAlphabet} from "nanoid";

const availableDatabases = [{ databaseId: 1, databaseVersion: '5.7' }, { databaseId: 4, databaseVersion: '8.0' }];

const getDatabaseIdByVersion = (mysql_version: string): number => {
    const db = availableDatabases.find(db => db.databaseVersion.startsWith(mysql_version));
    if (!db) {
        return 4; // default to MySQL 8.0 if version not found
    }
    return db.databaseId;
}

const getRandomShopName = (shop_system: string): string => {
    const safeCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(safeCharacters, 8);
    const randomId = nanoid();
    return `owen-${shop_system}-${randomId}`;
}

// Register shop-related tools with the MCP server
export function registerShopTools(server: McpServer, appClient: AppServiceClient) {

    server.tool(
        "list-shops",
        "Lists all shop instances. Use this to show available shops and their details such as shop_id, shop_image, created_at, etc.",
        {},
        async () => {
            console.debug("Invoking tool: list-shops");
            const result = await appClient.sendAction("shop.get_shops");
            return {
                content: [{ type: "text", text: JSON.stringify(result.data.shops, null, 2) }],
            };
        }
    );

    server.tool(
        "list-shops-installed",
        "Lists shops installed. (Tracking List to avoid going over the maximum number of 500 shops allowed per week.)",
        {},
        async () => {
            const result = await appClient.sendAction("shop.get_shops_installed");
            return {
                content: [{ type: "text", text: JSON.stringify(result.data.shops, null, 2) }],
            };
        }
    );

    server.tool(
        "get-shop",
        "Returns details about a specific store instance. Use this action to show a shop with a specific ID.",
        { shopId: z.number().describe("The numeric ID of the shop.") },
        async ({ shopId }) => {
            const result = await appClient.sendAction("shop.get_shop", { shop_id: shopId });
            return {
                content: [{ type: "text", text: JSON.stringify(result.data.shop, null, 2) }],
            };
        }
    );

    server.tool(
        "get-install-logs",
        "Calls for the logs of a certain task.",
        { taskId: z.number().describe("The numeric Task-ID") },
        async ({ taskId }) => {
            const message = await appClient.sendAction("task.get_logs", {
                task_id: taskId,
                force_provisioner_service: true,
            });
            return {
                content: [{ type: "text", text: JSON.stringify((message as any).data.logs, null, 2) }],
            };
        }
    );

    server.tool(
        "list-shop-images",
        "Shows all available images for shopping cart systems as well as their corresponding available php versions. Only these images can be used for creating new shop instances. Use this to find out which shop images are available and which php versions they support.",
        {},
        async () => {
            const result = await appClient.sendAction("shop.get_shop_images");
            return {
                content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            };
        }
    );

    server.tool(
        "delete-shop",
        "Deletes a shop instance. Caution: Irreversable!",
        { shopId: z.number().describe("The numeric ID of shop instance to be deleted") },
        async ({ shopId }) => {
            const result = await appClient.sendAction("shop.delete_shop", { shop_id: shopId });
            const ok = result.data.success === true;
            return {
                content: [{
                    type: "text",
                    text: ok
                        ? `Shop ${shopId} successfully deleted.`
                        : `Error while deleting Shop ${shopId}: ${JSON.stringify(result.data)}`,
                }],
            };
        }
    );

    server.tool(
        "create-shop-release",
        "Creates a new shop instance using a release version for integration.",
        {
            shop_system: z.string().describe("The shop system to use (e.g., 'shopware')."),
            shop_version: z.string().describe("The version of the shop system (e.g., '6.7.2.1')."),
            php_version: z.string().describe("The PHP version for the shop (e.g., '8.2')."),
            mysql_version: z.string().describe("The MySQL version for the shop (either '8.0' or '5.7')."),
            integration_variant: z.string().describe("The variant of the integration (either 'payone', 'omnichannel' or 'worldline')."),
            integration_version: z.string().describe("The version of the integration (aka Plugin) to use. For release variant, provide the release version (e.g., '1.2.3')."),
        },
        async ({
                   shop_system,
                   shop_version,
                   php_version,
                   mysql_version,
                   integration_variant,
                   integration_version,
               }) => {
            console.debug("Invoking tool: create-shop-release");

            const shopName = getRandomShopName(shop_system);
            let selectedDatabase = getDatabaseIdByVersion(mysql_version);

            const shopConfiguration = {
                php_version: php_version,
                database_id: selectedDatabase,
                groups: null,
                integration: {
                    variant: integration_variant,
                    version: {
                        type: "release",
                        version: integration_version,
                    },
                    configured: true,
                },
                auth: {
                    enabled: false,
                    user: '',
                    passwd: '',
                },
            };

            const createShopArgs = {
                name: shopName,
                type: shop_system,
                version: {
                    type: "release",
                    value: shop_version,
                },
                configuration: shopConfiguration,
            }

            console.debug("Arguments for shop.create_shop:", JSON.stringify(createShopArgs, null, 2));
            const result = await appClient.sendAction("shop.create_shop", createShopArgs);
            return {
                content: [{
                    type: "text",
                    text: result.data.success
                        ? `Shop successfully created with ID: ${result.data.shop_id}..`
                        : `Error creating shop: ${result.data.error_message || JSON.stringify(result.data)}`,
                }],
            };
        }
    );

    server.tool(
        "create-shop-github-branch",
        "Creates a new shop instance using a GitHub branch for integration.",
        {
            shop_system: z.string().describe("The shop system to use (e.g., 'shopware')."),
            shop_version: z.string().describe("The version of the shop system (e.g., '6.7.2.1')."),
            php_version: z.string().describe("The PHP version for the shop (e.g., '8.2')."),
            mysql_version: z.string().describe("The MySQL version for the shop (either '8.0' or '5.7')."),
            integration_variant: z.string().describe("The variant of the integration (either 'payone', 'omnichannel' or 'worldline')."),
            integration_repository_name: z.string().describe("The name of the github-repository."),
            integration_repository_owner: z.string().describe("The owner of the github-repository."),
            integration_repository_branch: z.string().describe("The branch of the github-repository."),
        },
        async ({
                   shop_system,
                   shop_version,
                   php_version,
                   mysql_version,
                   integration_variant,
                   integration_repository_name,
                   integration_repository_owner,
                   integration_repository_branch,
               }) => {
            console.debug("Invoking tool: create-shop-github-branch");

            const shopName = getRandomShopName(shop_system);
            let selectedDatabase = getDatabaseIdByVersion(mysql_version);

            const shopConfiguration = {
                php_version: php_version,
                database_id: selectedDatabase,
                groups: null,
                integration: {
                    variant: integration_variant,
                    version: {
                        type: "github_branch",
                        repository_owner: integration_repository_owner,
                        repository_name: integration_repository_name,
                        branch_name: integration_repository_branch,
                    },
                    configured: true,
                },
                auth: {
                    enabled: false,
                    user: '',
                    passwd: '',
                },
            };

            const createShopArgs = {
                name: shopName,
                type: shop_system,
                version: {
                    type: "release",
                    value: shop_version,
                },
                configuration: shopConfiguration,
            }

            console.debug("Arguments for shop.create_shop:", JSON.stringify(createShopArgs, null, 2));
            const result = await appClient.sendAction("shop.create_shop", createShopArgs);
            return {
                content: [{
                    type: "text",
                    text: result.data.success
                        ? `Shop successfully created with ID: ${result.data.shop_id}. Using GitHub branch ${integration_repository_branch}.`
                        : `Error creating shop: ${result.data.error_message || JSON.stringify(result.data)}`,
                }],
            };
        }
    );
}