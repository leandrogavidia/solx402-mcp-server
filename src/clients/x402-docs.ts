import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createGitbookMcpClient } from "./gitbook.js";
import { mcpConfig } from "../config/index.js";
import { McpLogger } from "../utils/logger.js";

export async function createX402DocsMcpClient(): Promise<{
    client: Client;
    listTools(): Promise<any[]>;
}> {
    try {
        const x402DocsMcpClient = await createGitbookMcpClient({
            name: mcpConfig.clients.x402Docs.name,
            version: mcpConfig.clients.x402Docs.version,
            docsUrl: mcpConfig.clients.x402Docs.docsUrl
        });
        return x402DocsMcpClient
    } catch (err) {
        McpLogger.error("Error creating X402 Docs MCP Client:", String(err));
        throw err;
    }
}