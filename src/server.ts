import express, { type Request, type Response } from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import z from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { mcpConfig } from "./config/index.js";
import { McpLogger } from "./utils/logger.js";

import { useFacilitator } from "x402/verify";
import { createX402DocsMcpClient } from "./clients/x402-docs.js";
// import { getFetchWithPayerHandler, getkeypair } from "./on-chain/wallet.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { lookupKnownSPLToken } from "@faremeter/info/solana";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { USDC_DECIMALS } from "./config/constants.js";

import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import axios from "axios";

import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";
import { getkeypair, getSigner } from "./on-chain/wallet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createMcpServer() {
    const server = new McpServer(
        {
            name: mcpConfig.server.name,
            version: mcpConfig.server.version,
        },
        {
            capabilities: {
                tools: {},
                resources: {},
            },
        },
    );

    // Register X402 Protocol Flow Diagram Resource

    server.registerTool(
        "x402-protocol-flow",
        {
            title: "X402 Protocol Flow Diagram",
            description: "Visual diagram showing the X402 protocol flow and architecture",
            inputSchema: {},
        },
        async () => {
            try {
                const imagePath = path.join(__dirname, "..", "assets", "x402-protocol-flow.avif");
                const imageBuffer = await fs.readFile(imagePath);
                const base64Image = imageBuffer.toString("base64");

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'This is a x402 diagram flow:',
                        },
                        {
                            type: "image",
                            data: base64Image,
                            mimeType: "image/avif",
                        },
                    ],
                };
            } catch (err) {
                McpLogger.error(`Failed to read x402-protocol-flow.avif: ${err}`);
                throw new Error(`Failed to read resource: ${(err as Error)?.message ?? err}`);
            }
        }
    );

    // X402 Documentation Search Tool

    server.registerTool(
        "search_x402_documentation",
        {
            title: "Search X402 Documentation",
            description: "Search across the documentation to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about x402, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.",
            inputSchema: {
                query: z.string().describe("The search query string"),
            }
        },
        async ({ query }) => {
            try {
                const x402DocsMcpClient = await createX402DocsMcpClient();

                const response = await x402DocsMcpClient.client.callTool({ name: "searchDocumentation", arguments: { query } })

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(response, null, 2),
                        },
                    ],
                };

            } catch (err) {
                const isAbort = (err as Error)?.name === "AbortError";

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    error: isAbort ? "Request timed out" : "Failed to fetch documentation",
                                    reason: String((err as Error)?.message ?? err),
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }
        }
    )

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
        async ({ limit = 500 }) => {

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

    // Get USDC Balance

    server.registerTool(
        "get_wallet_usdc_balance",
        {
            title: "Get Wallet USDC Balance",
            description: "Retrieve the USDC balance of the configured wallet.",
            inputSchema: {},
        },
        async () => {
            try {
                const keypair = getkeypair();
                const connection = new Connection(mcpConfig.rpcUrl);

                const usdcInfo = lookupKnownSPLToken(mcpConfig.clusterId, "USDC");

                if (!usdcInfo) {
                    throw new Error("USDC token info not found");
                }

                const usdcMint = new PublicKey(usdcInfo.address);
                const walletPublicKey = keypair.publicKey;

                const tokenAccountAddress = await getAssociatedTokenAddress(
                    usdcMint,
                    walletPublicKey
                );

                let balance = 0;
                let balanceFormatted = "0.00";
                let accountExists = false;

                try {
                    const tokenAccount = await getAccount(connection, tokenAccountAddress);
                    const decimals = USDC_DECIMALS;

                    balance = Number(tokenAccount.amount);
                    balanceFormatted = (balance / Math.pow(10, decimals)).toFixed(USDC_DECIMALS);
                    accountExists = true;
                } catch (error) {
                    McpLogger.warn(`Token account not found or error: ${error}`);
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    wallet: walletPublicKey.toBase58(),
                                    network: mcpConfig.clusterId,
                                    tokenAccount: tokenAccountAddress.toBase58(),
                                    accountExists,
                                    balance: balance,
                                    balanceFormatted,
                                    symbol: "USDC",
                                    mint: usdcMint.toBase58(),
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            } catch (err) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    error: "Failed to fetch USDC balance",
                                    reason: String((err as Error)?.message ?? err),
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }
        }
    );

    server.registerTool(
        "consume_x402_service",
        {
            title: "Consume X402 Service",
            description: "Consume a specific X402 service.",
            inputSchema: {
                x402ServiceUrl: z.string().describe("The URL of the X402 service to consume"),
            },
        },
        async ({ x402ServiceUrl }) => {
            const startTime = Date.now();
            try {
                const signer = await getSigner();

                const url = new URL(x402ServiceUrl);
                const baseURL = `${url.protocol}//${url.host}`;
                const path = url.pathname + url.search;

                const api = withPaymentInterceptor(
                    axios.create({
                        baseURL: baseURL,
                        timeout: 60000,
                        headers: {
                            'User-Agent': 'solx402-mcp-server/1.0.0',
                        },
                    }),
                    signer,
                );

                const response = await api.get(path);
                const duration = Date.now() - startTime;

                let paymentResponse = null;

                try {
                    if (response.headers["x-payment-response"]) {
                        paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
                        McpLogger.info(`Payment response decoded successfully`);
                    } else {
                        McpLogger.warn(`No x-payment-response header found in response`);
                    }
                } catch (decodeError) {
                    McpLogger.error(`Failed to decode payment response: ${decodeError}`);
                    paymentResponse = {
                        error: "Failed to decode payment response",
                        rawHeader: response.headers["x-payment-response"],
                        decodeError: String(decodeError)
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                url: x402ServiceUrl,
                                status: response.status,
                                duration: `${duration}ms`,
                                data: response.data,
                                paymentResponse: paymentResponse,
                                timestamp: new Date().toISOString(),
                            }, null, 2),
                        },
                    ],
                };
            } catch (error) {
                const duration = Date.now() - startTime;
                McpLogger.error(`X402 service consumption failed after ${duration}ms: ${error}`);

                const errorInfo = {
                    success: false,
                    url: x402ServiceUrl,
                    duration: `${duration}ms`,
                    error: "Failed to consume x402 service",
                    timestamp: new Date().toISOString(),
                    details: {} as any,
                };

                if (axios.isAxiosError(error)) {
                    errorInfo.details = {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        timeout: error.code === 'ECONNABORTED',
                        network: error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED',
                    };
                } else {
                    errorInfo.details = {
                        message: (error as Error)?.message || String(error),
                        type: (error as Error)?.name || 'Unknown',
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(errorInfo, null, 2),
                        },
                    ],
                };
            }
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