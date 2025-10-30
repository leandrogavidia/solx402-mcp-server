import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from "./constants.js";
import { facilitatorUrl, host, isMainnet, maxPrice, port, useStreamHttp } from "./environment.js";

export const mcpConfig = {
    network: isMainnet ? "solana" : "solana-devnet",
    server: {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION
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