import express, { type Request, type Response } from "express";
import cors from "cors";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { mcpConfig } from "./config/index.js";
import { McpLogger } from "./utils/logger.js";

import { tools } from "./tools/index.js";

async function createMcpServer() {
    const server = new McpServer(
        {
            name: mcpConfig.server.name,
            version: mcpConfig.server.version,
        },
        {
            capabilities: {},
        },
    );

    for (const t of tools) {
        server.registerTool(
            t.name,
            t.config,
            async (args) => {
                const result = await t.callback(args);
                return {
                    content: result.content.map(item => ({
                        ...item,
                        type: "text" as const,
                        text: item.text ?? String(item.data ?? "")
                    }))
                };
            }
        );
    }

    return server;
}

export async function run() {
    const server = await createMcpServer();
    McpLogger.log(JSON.stringify({
        mcpConfig
    }, null, 2));
    if (!mcpConfig.environment.useStreamHttp) {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        McpLogger.info("Solx402 MCP Server running on stdio");
        McpLogger.info(`Mode: ${mcpConfig.environment.isMainnet ? "Mainnet" : "Devnet"}`);
        return;
    }

    const app = express();
    app.use(express.json());

    app.use(
        cors({
            origin: "*",
            allowedHeaders: ["Content-Type", "mcp-session-id"],
        })
    );

    app.post("/mcp", async (req: Request, res: Response) => {
        try {
            const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
                enableDnsRebindingProtection: true,
                sessionIdGenerator: undefined,
            });

            res.on('close', () => {
                McpLogger.info('Request closed');
                transport.close();
                server.close();
            });

            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            McpLogger.error('Error handling MCP request:', String(error));
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal server error',
                    },
                    id: null,
                });
            }
        }
    });

    app.get('/mcp', async (req: Request, res: Response) => {
        McpLogger.info('Received GET MCP request');
        res.writeHead(405).end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed."
            },
            id: null
        }));
    });

    app.delete('/mcp', async (req: Request, res: Response) => {
        McpLogger.info('Received DELETE MCP request');
        res.writeHead(405).end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed."
            },
            id: null
        }));
    });

    app.get("/health", (_req, res) => res.status(200).send("ok"));

    app.listen(mcpConfig.environment.port, mcpConfig.environment.host, () => {
        McpLogger.info(`MCP Stateless Streamable HTTP listening on http://${mcpConfig.environment.host}:${mcpConfig.environment.port}`);
        McpLogger.info(`Mode: ${mcpConfig.environment.isMainnet ? "Mainnet" : "Devnet"}`);
    });
}