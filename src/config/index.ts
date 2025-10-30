import { MCP_SERVER_NAME, MCP_SERVER_VERSION, X402_DOCS_GITBOOK_URL, X402_MCP_CLIENT_NAME, X402_MCP_CLIENT_VERSION } from "./constants.js";
import { facilitatorUrl, host, isMainnet, maxPrice, port, useStreamHttp } from "./environment.js";

export const mcpConfig = {
    network: isMainnet ? "solana" : "solana-devnet",
    server: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION
    },
    clients: {
        x402Docs: {
            name: X402_MCP_CLIENT_NAME,
            version: X402_MCP_CLIENT_VERSION,
            docsUrl: X402_DOCS_GITBOOK_URL
        }  
    },
    environment: {
        useStreamHttp,
        port,
        host,
        isMainnet,
        facilitatorUrl,
        maxPrice
    }
}