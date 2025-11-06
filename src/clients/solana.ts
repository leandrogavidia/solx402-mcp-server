import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { mcpConfig } from "../config/index.js";

export async function createSolanaMcpClient() {
    try {
        const client = new Client(
            {
                name: mcpConfig.clients.solana.name,
                version: mcpConfig.clients.solana.version,
            },
            {
                capabilities: {}
            }
        );

        const mcpServerUrl = new URL(mcpConfig.clients.solana.url);

        const transport = new StreamableHTTPClientTransport(mcpServerUrl) as Transport;

        await client.connect(transport);

        return {
            client,
            async listTools() {
                const resp = await client.listTools();
                return resp.tools ?? [];
            },
        };
    } catch (error) {
        console.error("Error connecting to GitBookClient:", String(error));
        throw error;
    }
}