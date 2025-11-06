import {
    MCP_SERVER_NAME,
    MCP_SERVER_VERSION,
    SOLANA_MCP_CLIENT_NAME,
    SOLANA_MCP_CLIENT_VERSION,
    SOLANA_MCP_SERVER_URL,
    X402_DOCS_GITBOOK_URL,
    X402_MCP_CLIENT_NAME,
    X402_MCP_CLIENT_VERSION
} from "./constants.js";
import {
    host,
    port,
} from "./environment.js";

export const mcpConfig = {
    server: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION
    },
    clients: {
        x402Docs: {
            name: X402_MCP_CLIENT_NAME,
            version: X402_MCP_CLIENT_VERSION,
            url: X402_DOCS_GITBOOK_URL
        },
        solana: {
            name: SOLANA_MCP_CLIENT_NAME,
            version: SOLANA_MCP_CLIENT_VERSION,
            url: SOLANA_MCP_SERVER_URL
        }
    },
    environment: {
        port,
        host
    },
}