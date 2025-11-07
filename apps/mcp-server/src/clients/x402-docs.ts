import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createGitbookMcpClient } from "./gitbook.js";
import { mcpConfig } from "../config/index.js";

export async function createX402DocsMcpClient(): Promise<{
    client: Client;
    listTools(): Promise<any[]>;
}> {
    try {
        const x402DocsMcpClient = await createGitbookMcpClient({
            name: mcpConfig.clients.x402Docs.name,
            version: mcpConfig.clients.x402Docs.version,
            docsUrl: mcpConfig.clients.x402Docs.url
        });
        return x402DocsMcpClient
    } catch (err) {
        console.error("Error creating X402 Docs MCP Client:", String(err));
        throw err;
    }
}