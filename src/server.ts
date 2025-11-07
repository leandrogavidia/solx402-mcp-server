import express, { type Request, type Response } from "express";
import cors from "cors";

import { parseAndValidateConfig } from "@smithery/sdk";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { mcpConfig } from "./config/index.js";

import { solX402Tools, solanaMcpServerTools } from "./tools/index.js";
import z from "zod";
import { DEFAULT_DEVNET_RPC_URL, PAYAI_FACILITATOR_URL } from "./config/constants.js";
import type { SessionConfig } from "./types/config.js";

export const configSchema = z.object({
    isMainnet: z.boolean().default(false).describe("Set to true for mainnet, false for devnet"),
    facilitatorUrl: z.string().default(PAYAI_FACILITATOR_URL).describe("URL of the x402 facilitator"),
    maxPrice: z.number().default(0).describe("Maximum price to pay for services in USDC. e.g 10000 = 0.01 USDC"),
    privateKey: z.string().describe("Private key in Bs58 format"),
    mainnetRpcUrl: z.string().describe("RPC URL for Solana mainnet"),
    devnetRpcUrl: z.string().default(DEFAULT_DEVNET_RPC_URL).describe("RPC URL for Solana devnet"),
    useSolanaMcpServer: z.boolean().default(false).describe("Set to true to use Solana MCP Server. Default false")
});

async function createMcpServer(config: SessionConfig) {
    const server = new McpServer(
        {
            name: mcpConfig.server.name,
            version: mcpConfig.server.version,
        },
        {
            capabilities: {},
        },
    );

    console.log("\n Creating MCP Server with config:", JSON.stringify({
        isMainnet: config.isMainnet,
        facilitatorUrl: config.facilitatorUrl,
        maxPrice: config.maxPrice,
        useSolanaMcpServer: config.useSolanaMcpServer
    }, null, 2));

    const tools = config.useSolanaMcpServer ? [...solX402Tools, ...solanaMcpServerTools] : solX402Tools;

    for (const t of tools) {
        server.registerTool(
            t.name,
            t.config,
            async (args) => {
                const result = await t.callback(args, config);
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
    console.log("\n", JSON.stringify({
        mcpConfig
    }, null, 2));

    const app = express();
    app.use(express.json());

    app.use(
        cors({
            origin: "*",
            allowedHeaders: ["Content-Type", "mcp-session-id"],
        })
    );

    app.post("/mcp", async (req: Request, res: Response) => {
        console.info('\n Received POST MCP request');

        const result = parseAndValidateConfig(req, configSchema);

        if (result.error) {
            const isDummyConfig = req.query.privateKey === 'string' ||
                req.query.mainnetRpcUrl === 'string';

            if (isDummyConfig) {
                console.info('\n Detected dummy config for deployment scanning');
                const sessionConfig: SessionConfig = {
                    isMainnet: false,
                    facilitatorUrl: PAYAI_FACILITATOR_URL,
                    maxPrice: 0,
                    privateKey: '',
                    mainnetRpcUrl: '',
                    devnetRpcUrl: DEFAULT_DEVNET_RPC_URL,
                    useSolanaMcpServer: false
                };

                try {
                    const sessionServer = await createMcpServer(sessionConfig);

                    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
                        enableDnsRebindingProtection: true,
                        sessionIdGenerator: undefined,
                    });

                    res.on('close', () => {
                        console.info('POST MCP request closed (dummy config)');
                        transport.close();
                        sessionServer.close();
                    });

                    await sessionServer.connect(transport);
                    await transport.handleRequest(req, res, req.body);
                    return;
                } catch (error) {
                    console.error('\n Error handling POST MCP request with dummy config:', String(error));
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
                    return;
                }
            } else {
                return res.status(400).json({
                    error: 'Invalid or missing configuration. Please provide required configuration parameters.',
                    details: result.error
                });
            }
        }

        const config = result.value;

        const sessionConfig: SessionConfig = {
            isMainnet: config.isMainnet ?? false,
            facilitatorUrl: config.facilitatorUrl ?? PAYAI_FACILITATOR_URL,
            maxPrice: config.maxPrice ?? 0,
            privateKey: config.privateKey,
            mainnetRpcUrl: config.mainnetRpcUrl,
            devnetRpcUrl: config.devnetRpcUrl ?? DEFAULT_DEVNET_RPC_URL,
            useSolanaMcpServer: config.useSolanaMcpServer ?? false
        };

        try {
            const sessionServer = await createMcpServer(sessionConfig);

            const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
                enableDnsRebindingProtection: true,
                sessionIdGenerator: undefined,
            });

            res.on('close', () => {
                console.info('POST MCP request closed');
                transport.close();
                sessionServer.close();
            });

            await sessionServer.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error('\n Error handling POST MCP request:', String(error));
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
        console.info('\n Received GET MCP request');

        const result = parseAndValidateConfig(req, configSchema);

        if (result.error) {
            // Allow dummy config during deployment scanning
            const isDummyConfig = req.query.privateKey === 'string' ||
                req.query.mainnetRpcUrl === 'string';

            if (isDummyConfig) {
                console.info('\n Detected dummy config for deployment scanning (GET)');
                // Use default/empty config for scanning
                const sessionConfig: SessionConfig = {
                    isMainnet: false,
                    facilitatorUrl: PAYAI_FACILITATOR_URL,
                    maxPrice: 0,
                    privateKey: '',
                    mainnetRpcUrl: '',
                    devnetRpcUrl: DEFAULT_DEVNET_RPC_URL,
                    useSolanaMcpServer: false
                };

                try {
                    const sessionServer = await createMcpServer(sessionConfig);

                    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
                        enableDnsRebindingProtection: true,
                        sessionIdGenerator: undefined,
                    });

                    res.on('close', () => {
                        console.info('GET MCP request closed (dummy config)');
                        transport.close();
                        sessionServer.close();
                    });

                    await sessionServer.connect(transport);
                    await transport.handleRequest(req, res, req.body);
                    return;
                } catch (error) {
                    console.error('\n Error handling GET MCP request with dummy config:', String(error));
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
                    return;
                }
            } else {
                return res.status(400).json({ error: 'Invalid configuration' });
            }
        }

        const config = result.value;

        const sessionConfig: SessionConfig = {
            isMainnet: config.isMainnet ?? false,
            facilitatorUrl: config.facilitatorUrl ?? PAYAI_FACILITATOR_URL,
            maxPrice: config.maxPrice ?? 0,
            privateKey: config.privateKey,
            mainnetRpcUrl: config.mainnetRpcUrl,
            devnetRpcUrl: config.devnetRpcUrl ?? DEFAULT_DEVNET_RPC_URL,
            useSolanaMcpServer: config.useSolanaMcpServer ?? false
        };

        try {
            const sessionServer = await createMcpServer(sessionConfig);

            const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
                enableDnsRebindingProtection: true,
                sessionIdGenerator: undefined,
            });

            res.on('close', () => {
                console.info('GET MCP request closed');
                transport.close();
                sessionServer.close();
            });

            await sessionServer.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error('\n Error handling GET MCP request:', String(error));
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

    app.delete('/mcp', async (req: Request, res: Response) => {
        console.info('\n Received DELETE MCP request');
        res.writeHead(405).end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed."
            },
            id: null
        }));
    });

    app.get("/.well-known/mcp-config", (_req, res) => {
        const schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$id": `http://${mcpConfig.environment.host}:${mcpConfig.environment.port}/.well-known/mcp-config`,
            "title": "Solx402 MCP Server Configuration",
            "description": "Configuration for connecting to the Solx402 MCP server",
            "x-query-style": "dot+bracket",
            "type": "object",
            "properties": {
                "isMainnet": {
                    "type": "boolean",
                    "title": "Use Mainnet",
                    "description": "Set to true for mainnet, false for devnet",
                    "default": false
                },
                "facilitatorUrl": {
                    "type": "string",
                    "format": "uri",
                    "title": "Facilitator URL",
                    "description": "URL of the x402 facilitator",
                    "default": PAYAI_FACILITATOR_URL
                },
                "maxPrice": {
                    "type": "number",
                    "title": "Max Price",
                    "description": "Maximum price to pay for services in USDC. e.g 10000 = 0.01 USDC",
                    "default": 0,
                    "minimum": 0
                },
                "privateKey": {
                    "type": "string",
                    "title": "Private Key",
                    "description": "Private key in Bs58 format",
                    "x-secret": true
                },
                "mainnetRpcUrl": {
                    "type": "string",
                    "format": "uri",
                    "title": "Mainnet RPC URL",
                    "description": "RPC URL for Solana mainnet"
                },
                "devnetRpcUrl": {
                    "type": "string",
                    "format": "uri",
                    "title": "Devnet RPC URL",
                    "description": "RPC URL for Solana devnet",
                    "default": DEFAULT_DEVNET_RPC_URL
                },
                "useSolanaMcpServer": {
                    "type": "boolean",
                    "title": "Use Solana MCP Server",
                    "description": "Set to true to use Solana MCP Server. Default false",
                    "default": false
                }
            },
            "required": ["privateKey", "mainnetRpcUrl"],
            "additionalProperties": false
        };

        res.setHeader('Content-Type', 'application/json');
        res.json(schema);
    });

    app.get("/health", (_req, res) => res.status(200).send("ok"));

    app.listen(mcpConfig.environment.port, mcpConfig.environment.host, () => {
        console.info(`\n MCP Stateless Streamable HTTP listening on http://${mcpConfig.environment.host}:${mcpConfig.environment.port}`);
    });
}