import express, { type Request, type Response } from "express";
import cors from "cors";

import z from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { mcpConfig } from "./config/index.js";
import { McpLogger } from "./utils/logger.js";

import { useFacilitator } from "x402/verify";

async function createMcpServer() {
    const server = new McpServer(
        {
            name: mcpConfig.server.name,
            version: mcpConfig.server.version,
        },
        {
            capabilities: {
                tools: {},
            },
        },
    );



    // x402 Bazaar (Discovery Layer)

    server.registerTool(
        "get_x402_services",
        {
            title: "Get X402 Services",
            description: "Retrieve a list of available X402 services from the facilitator.",
            inputSchema: {
                limit: z.number().min(1).optional().describe("Maximum number of services to retrieve"),
            },
        },
        async ({ limit = 500 }: { limit?: number | undefined }) => {
            
            const { list } = useFacilitator({
                url: mcpConfig.environment.facilitatorUrl,
            });

            const services = await list({
                limit,
            });

            let solanaServices = services.items.filter(service => service.accepts[0]?.network === mcpConfig.network)
            
            if (mcpConfig.environment.maxPrice > 0) {
                solanaServices = solanaServices.filter(service => {
                    const maxAmount = service.accepts[0]?.maxAmountRequired;
                    return maxAmount !== undefined && Number(maxAmount) <= mcpConfig.environment.maxPrice;
                });
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            services: solanaServices,
                            totalServices: solanaServices.length,
                            x402Version: services.x402Version
                        }, null, 2),
                    },
                ],
            };
        }
    )

    return server;
}

export async function run() {
    const server = await createMcpServer();
    McpLogger.log(JSON.stringify(mcpConfig.environment, null, 2));
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