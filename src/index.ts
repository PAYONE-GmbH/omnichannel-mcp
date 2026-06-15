import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TokenManager } from "./auth/token-manager.js";
import { createPatsyMcpServer } from "./server.js";
import { verifyToken, PatsyUser } from "./auth/keycloak.js";

const APP_WS_URL = process.env.APP_SERVICE_WS_URL || "ws://patsy-app-service:3000/";
const PORT = parseInt(process.env.MCP_PORT || "3100");
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://authorize.patsy-dev.payone-office.de";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "patsy";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "patsy-mcp";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || "";

const app = express();
app.use(express.json());

let mcpServer: ReturnType<typeof createPatsyMcpServer> | null = null;

async function authenticateRequest(authHeader: string | undefined): Promise<PatsyUser> {
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.slice(7);

    if (INTERNAL_API_KEY && token === INTERNAL_API_KEY) {
        return {
            azp: "patsy-mcp",
            sub: "api-key-user",
            preferredUsername: "mcp-api-key",
            fullName: "MCP API Key User",
            email: "",
            roles: ["patsy_read_general", "patsy_write_general"],
            groups: ["patsy-user"],
        };
    }

    return verifyToken(token);
}

async function start() {
    const tokenManager = new TokenManager({
        keycloakUrl: KEYCLOAK_URL,
        realm: KEYCLOAK_REALM,
        clientId: KEYCLOAK_CLIENT_ID,
        clientSecret: KEYCLOAK_CLIENT_SECRET,
    });

    console.info("Fetching initial token from Keycloak...");
    await tokenManager.getToken();
    console.info("Initial token obtained");

    app.post("/mcp", async (req, res) => {
        try {
            const user = await authenticateRequest(req.headers.authorization);
            console.info(`MCP request from: ${user.preferredUsername}`);

            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });

            res.on("close", () => {
                transport.close();
            });

            await mcpServer.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error("Auth error:", error);
            res.status(401).json({ error: "Authentication failed" });
        }
    });

    app.get("/health", (_req, res) => {
        res.json({
            status: "ok",
            service: "pcp-mcp"
        });
    });

    app.listen(PORT, () => {
        console.info(`Patsy MCP Server listening on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error("Failed to start Patsy MCP Service:", err);
    process.exit(1);
});