import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TokenManager } from "./auth/token-manager.js";
import { createPcpMcpServer } from "./server.js";
import { verifyToken, PatsyUser } from "./auth/keycloak.js";
import { PcpClient } from "./pcp/client.js";

const PORT = parseInt(process.env.MCP_PORT || "3100");
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";
const PCP_API_HOST = process.env.PCP_API_HOST || "";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://authorize.patsy-dev.payone-office.de";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "patsy";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "pcp-mcp";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || "";

const PCP_API_KEY = process.env.PCP_API_KEY || "";
const PCP_API_SECRET = process.env.PCP_API_SECRET || "";
const PCP_MERCHANT_ID = process.env.PCP_MERCHANT_ID || "";

const app = express();
app.use(express.json());

async function authenticateRequest(authHeader: string | undefined): Promise<PatsyUser> {
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.slice(7);

    if (INTERNAL_API_KEY && token === INTERNAL_API_KEY) {
        return {
            azp: "pcp-mcp",
            sub: "pcp-api-key-user",
            preferredUsername: "pcp-mcp-api-key",
            fullName: "PCP MCP API Key User",
            email: "",
            roles: [],
            groups: [],
        };
    }

    return verifyToken(token);
}

async function start() {
    if (!PCP_API_KEY || !PCP_API_SECRET || !PCP_MERCHANT_ID) {
        console.error("PCP_API_KEY, PCP_API_SECRET, and PCP_MERCHANT_ID must be set");
        process.exit(1);
    }

    const pcpClient = new PcpClient({
        apiKey: PCP_API_KEY,
        apiSecret: PCP_API_SECRET,
        merchantId: PCP_MERCHANT_ID,
        ...(PCP_API_HOST && { host: PCP_API_HOST }),
    });

    const mcpServer = createPcpMcpServer(pcpClient);

    if (KEYCLOAK_CLIENT_SECRET) {
        const tokenManager = new TokenManager({
            keycloakUrl: KEYCLOAK_URL,
            realm: KEYCLOAK_REALM,
            clientId: KEYCLOAK_CLIENT_ID,
            clientSecret: KEYCLOAK_CLIENT_SECRET,
        });

        console.info("Fetching initial token from Keycloak...");
        await tokenManager.getToken();
        console.info("Initial token obtained");
    } else {
        console.info("Keycloak not configured, skipping token fetch (API key auth only)");
    }

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
            service: "pcp-mcp",
        });
    });

    app.listen(PORT, () => {
        console.info(`PCP MCP Server listening on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error("Failed to start PCP MCP Service:", err);
    process.exit(1);
});