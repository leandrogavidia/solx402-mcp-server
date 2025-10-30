import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { McpLogger } from "../utils/logger.js"; 

export async function createGitbookMcpClient({
    name,
    version,
    docsUrl
}: {
    name: string;
    version: string;
    docsUrl: string;
}) {
    try {
        const client = new Client(
            {
                name,
                version,
            },
            {
                capabilities: {}
            }
        );

        const mcpServerUrl = new URL(`${docsUrl}/~gitbook/mcp`);

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
        McpLogger.error("Error connecting to GitBookClient:", String(error));
        throw error;
    }
}