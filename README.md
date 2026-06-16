# PCP MCP Server

MCP (Model Context Protocol) server for the PAYONE Commerce Platform (PCP). Provides an AI-accessible interface that abstracts the [PCP Node.js SDK](https://github.com/PAYONE-GmbH/PCP-server-nodeJS-SDK), enabling LLMs and AI agents to interact with the PAYONE Commerce Platform.

## Architecture

```
AI Agent / n8n / LLM Client
        │
        ▼ (MCP over Streamable HTTP)
┌─────────────────────────┐
│   PCP MCP Server        │
│   (Express + MCP SDK)   │
│                         │
│   ┌───────────────────┐ │
│   │  Authentication   │ │
│   │  (API Key / KC)   │ │
│   └───────────────────┘ │
│   ┌───────────────────┐ │
│   │   MCP Tools       │ │
│   │  ┌─────────────┐  │ │
│   │  │CommerceCases│  │ │
│   │  │ Checkouts   │  │ │
│   │  │ Payments    │  │ │
│   │  │ OrderMgmt   │  │ │
│   │  │ PaymentInfo │  │ │
│   │  └─────────────┘  │ │
│   └───────────────────┘ │
│   ┌───────────────────┐ │
│   │  PCP Node.js SDK  │ │
│   └───────────────────┘ │
└─────────────────────────┘
        │
        ▼ (HTTPS)
  PAYONE Commerce Platform API
```

## Available Tools

### Commerce Cases

| Tool | Description |
|---|---|
| `list_commerce_cases` | List commerce cases with optional query filters |
| `get_commerce_case` | Get a single commerce case by ID |
| `create_commerce_case` | Create a new commerce case |
| `update_commerce_case` | Patch an existing commerce case |

### Checkouts

| Tool | Description |
|---|---|
| `list_checkouts` | List checkouts with optional query filters |
| `get_checkout` | Get a checkout by commerce case and checkout ID |
| `create_checkout` | Create a new checkout within a commerce case |
| `update_checkout` | Patch an existing checkout |
| `remove_checkout` | Delete a checkout |
| `complete_checkout` | Finalize a checkout / complete an order |

### Payments

| Tool | Description |
|---|---|
| `create_payment` | Create a payment execution for a checkout |
| `capture_payment` | Capture a previously authorized payment |
| `cancel_payment` | Cancel a payment execution |
| `refund_payment` | Refund a payment execution |
| `complete_payment` | Complete a payment requiring additional steps |
| `pause_payment` | Pause a payment execution |
| `refresh_payment` | Refresh a payment execution status |
| `create_fund_split` | Create a fund split for a payment event |

### Order Management

| Tool | Description |
|---|---|
| `create_order` | Create an order for a checkout |
| `deliver_order` | Mark an order as delivered |
| `return_order` | Process a return for an order |
| `cancel_order` | Cancel an order |

### Payment Information

| Tool | Description |
|---|---|
| `create_payment_information` | Create payment information for a checkout |
| `get_payment_information` | Get payment information by ID |
| `refund_payment_information` | Refund via payment information |

## Prerequisites

- Node.js 24+
- Docker & Docker Compose
- Traefik (as edge router in the target environment)
- PAYONE Commerce Platform API credentials

## Configuration

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description |
|---|---|
| `PCP_API_KEY` | PCP API key |
| `PCP_API_SECRET` | PCP API secret |
| `PCP_MERCHANT_ID` | PCP merchant ID |
| `INTERNAL_API_KEY` | Static API key for authentication |

### Optional Variables

| Variable | Default | Description |
|---|---|---|
| `CONTAINER_NAME_PREFIX` | `pcp-mcp` | Docker container name prefix |
| `MCP_PORT` | `3100` | Container-internal server port |
| `PCP_API_HOST` | `https://commerce-api.payone.com/v1` | PCP API base URL override |
| `TRAEFIK_ROUTER_SERVICE` | `pcp-mcp` | Traefik router name |
| `TRAEFIK_HOST_RULE_SERVICE` | `mcp.patsy-dev.payone-office.de` | Traefik host rule |
| `KEYCLOAK_URL` | `https://authorize.patsy-dev.payone-office.de` | Keycloak base URL |
| `KEYCLOAK_REALM` | `patsy` | Keycloak realm |
| `KEYCLOAK_CLIENT_ID` | `pcp-mcp` | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | _(empty)_ | Keycloak client secret (leave empty for API key only mode) |

## Authentication

The server supports two authentication methods:

### API Key

Set `INTERNAL_API_KEY` in `.env` and pass it as a Bearer token:

```
Authorization: Bearer <your-api-key>
```

### Keycloak (Optional)

Set `KEYCLOAK_CLIENT_SECRET` in `.env` to enable Keycloak JWT validation. When left empty, the server starts in API key only mode.

## Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npx tsc --noEmit
```

## Deployment

### Docker Compose

```bash
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml
# Edit .env with your credentials
bash service.sh build
bash service.sh run
```

### Service Commands

| Command | Description |
|---|---|
| `bash service.sh build` | Build the container image |
| `bash service.sh rebuild` | Build without cache |
| `bash service.sh run` | Start the container |
| `bash service.sh update` | Pull latest changes, rebuild, and restart |
| `bash service.sh restart` | Restart the container |
| `bash service.sh stop` | Stop and remove the container |

### Verify Deployment

```bash
curl -s https://mcp.patsy-dev.payone-office.de/health
```

Expected response:

```json
{"status":"ok","service":"pcp-mcp"}
```

## Usage

### MCP Initialize

```bash
curl -s -X POST https://mcp.patsy-dev.payone-office.de/mcp \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "test", "version": "1.0.0" }
    }
  }'
```

### Tool Call Example

```bash
curl -s -X POST https://mcp.patsy-dev.payone-office.de/mcp \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "list_commerce_cases",
      "arguments": {}
    }
  }'
```

## Project Structure

```
pcp-mcp/
├── docker-compose.yml
├── docker-compose.override.yml.example
├── image/
│   └── Dockerfile
├── service.sh
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                          # Express server, auth, entry point
    ├── server.ts                         # MCP server factory
    ├── auth/
    │   ├── keycloak.ts                   # Keycloak JWT verification
    │   └── token-manager.ts              # Keycloak token lifecycle
    ├── pcp/
    │   └── client.ts                     # PCP SDK configuration wrapper
    └── tools/
        ├── commerce-cases.ts             # Commerce Case API tools
        ├── checkouts.ts                  # Checkout API tools
        ├── payments.ts                   # Payment Execution API tools
        ├── order-management.ts           # Order Management API tools
        └── payment-information.ts        # Payment Information API tools
```

## Dependencies

| Package | Purpose |
|---|---|
| `@modelcontextprotocol/sdk` | MCP server implementation |
| `pcp-server-nodejs-sdk` | PAYONE Commerce Platform SDK |
| `express` | HTTP server |
| `jsonwebtoken` / `jwks-rsa` | Keycloak JWT validation |
| `zod` | Input schema validation |