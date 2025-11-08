import z from "zod";
import type { ToolDefinition } from "../types/index.js";

import { createX402DocsMcpClient } from "../clients/x402-docs.js";
import { useFacilitator } from "x402/verify";
import { getkeypair, getSigner } from "../on-chain/wallet.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { lookupKnownSPLToken } from "@faremeter/info/solana";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { USDC_DECIMALS } from "../config/constants.js";
import { decodeXPaymentResponse, withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { solanaFacilitators } from "facilitators"
import { createSolanaMcpClient } from "../clients/solana.js";


export const solX402Tools: ToolDefinition[] = [
    // Register x402 Protocol Flow Diagram Resource

    {
        name: "x402_protocol_flow",
        config: {
            title: "x402 Protocol Flow Diagram",
            description: "Visual diagram showing the x402 protocol flow and architecture",
            inputSchema: {},
        },
        callback: async () => {
            try {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'This is a x402 diagram flow:',
                        },
                        {
                            type: "text",
                            text: "https://raw.githubusercontent.com/leandrogavidia/solx402-mcp-server/refs/heads/main/apps/mcp-server/assets/x402-protocol-flow.avif",
                        },
                    ],
                };
            } catch (err) {
                console.error(`Failed to fetch x402-protocol-flow.avif from URL: ${err}`);
                throw new Error(`Failed to fetch resource: ${(err as Error)?.message ?? err}`);
            }
        }
    },

    // x402 Documentation Search Tool

    {
        name: "search_x402_documentation",
        config: {
            title: "Search X402 Documentation",
            description: "Search across the documentation to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about x402, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.",
            inputSchema: {
                query: z.string().describe("The search query string"),
            },
        },
        callback: async ({ query }) => {
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
    },

    // x402 Bazaar (Discovery Layer)

    {
        name: "get_x402_services",
        config: {
            title: "Get X402 Services",
            description: "Retrieve a list of available X402 services from the facilitator.",
            inputSchema: {
                facilitatorUrl: z.string().url().optional().describe("The URL of the X402 facilitator to query (By default your facilitator url"),
                limit: z.number().min(1).default(500).optional().describe("Maximum number of services to retrieve"),
            },
        },
        callback: async ({ limit = 500, facilitatorUrl }, sessionConfig) => {
            try {
                const maxPrice = sessionConfig.maxPrice;
                const isMainnet = sessionConfig.isMainnet;

                const { list } = useFacilitator({
                    url: facilitatorUrl as `${string}://${string}` || sessionConfig.facilitatorUrl,
                });

                const services = await list({
                    limit,
                });

                const network = isMainnet ? "solana" : "solana-devnet";
                let solanaServices = services.items.filter(service => service.accepts[0]?.network === network)

                if (maxPrice > 0) {
                    solanaServices = solanaServices.filter(service => {
                        const maxAmount = service.accepts[0]?.maxAmountRequired;
                        return maxAmount !== undefined && Number(maxAmount) <= maxPrice;
                    });
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                services: solanaServices,
                                totalServices: solanaServices.length,
                                x402Version: services.x402Version,
                                config: {
                                    facilitatorUrl,
                                    maxPrice,
                                    network,
                                }
                            }, null, 2),
                        },
                    ],
                };
            } catch (err) {
                console.error(`Failed to fetch X402 services: ${err}`);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    error: "Failed to fetch X402 services",
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
    },

    // Get Public Key

    {
        name: "get_wallet_public_key",
        config: {
            title: "Get Wallet Public Key",
            description: "Retrieve the public key of the configured wallet.",
            inputSchema: {},
        },
        callback: async (args, sessionConfig) => {
            try {
                const keypair = getkeypair(sessionConfig.privateKey);
                const walletPublicKey = keypair.publicKey.toBase58();

                const isMainnet = sessionConfig.isMainnet;
                const network = isMainnet ? "solana" : "solana-devnet";

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    walletPublicKey,
                                    network,
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
                                    error: "Failed to fetch wallet public key",
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
    },

    // Get USDC Balance

    {
        name: "get_wallet_usdc_balance",
        config: {
            title: "Get Wallet USDC Balance",
            description: "Retrieve the USDC balance of the configured wallet.",
            inputSchema: {},
        },
        callback: async (args, sessionConfig) => {
            try {
                const isMainnet = sessionConfig.isMainnet;

                const rpcUrl = isMainnet
                    ? sessionConfig.mainnetRpcUrl
                    : (sessionConfig.devnetRpcUrl);

                const clusterId = isMainnet ? "mainnet-beta" : "devnet";

                const keypair = getkeypair(sessionConfig.privateKey);
                const connection = new Connection(rpcUrl);

                const usdcInfo = lookupKnownSPLToken(clusterId, "USDC");

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
                    console.warn(`Token account not found or error: ${error}`);
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    wallet: walletPublicKey.toBase58(),
                                    network: clusterId,
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
    },

    // Consume x402 Service

    {
        name: "consume_x402_service",
        config: {
            title: "Consume X402 Service",
            description: "Consume a specific X402 service.",
            inputSchema: {
                x402ServiceUrl: z.string().describe("The URL of the X402 service to consume"),
            },
        },
        callback: async ({ x402ServiceUrl }, sessionConfig) => {
            const startTime = Date.now();
            try {
                const signer = await getSigner(sessionConfig.privateKey);

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
                        console.info(`Payment response decoded successfully`);
                    } else {
                        console.warn(`No x-payment-response header found in response`);
                    }
                } catch (decodeError) {
                    console.error(`Failed to decode payment response: ${decodeError}`);
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
                console.error(`X402 service consumption failed after ${duration}ms: ${error}`);

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
    },

    // Get Facilitators

    {
        name: "get_facilitators",
        config: {
            title: "Get Facilitators",
            description: "Retrieve a list of known Solana facilitators.",
            inputSchema: {},
        },
        callback: async () => {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                facilitators: solanaFacilitators,
                                totalFacilitators: solanaFacilitators.length,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    },

];

export const solanaMcpServerTools: ToolDefinition[] = [
    // Solana Anchor Framework Expert Tool

    {
        name: "Ask_Solana_Anchor_Framework_Expert",
        config: {
            title: "Ask Solana Anchor Framework Expert",
            description: "Ask questions about developing on Solana with the Anchor Framework.",
            inputSchema: {
                question: z
                    .string()
                    .describe(
                        "Any question about the Anchor Framework. (how-to, concepts, APIs, SDKs, errors)"
                    ),
            },
        },
        callback: async ({ question }) => {
            try {
                const solanaMcpClient = await createSolanaMcpClient();

                const response = await solanaMcpClient.client.callTool({ name: "Ask_Solana_Anchor_Framework_Expert", arguments: { question } })

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
                                    error: isAbort ? "Request timed out" : "Failed to fetch Solana Anchor Framework expert answer",
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
    },

    {
        name: "Solana_Expert__Ask_For_Help",
        config: {
            title: "Solana Expert - Ask For Help",
            description: "A Solana expert that can answer questions about Solana development.",
            inputSchema: {
                question: z
                    .string()
                    .describe(
                        "A Solana related question. (how-to, concepts, APIs, SDKs, errors)\n Provide as much context about the problem as needed, to make the expert understand the problem. The expert will do a similarity search based on your question and provide you the results."
                    ),
            },
        },
        callback: async ({ question }) => {
            try {
                const solanaMcpClient = await createSolanaMcpClient();

                const response = await solanaMcpClient.client.callTool({ name: "Solana_Expert__Ask_For_Help", arguments: { question } })

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
                                    error: isAbort ? "Request timed out" : "Failed to fetch Solana expert answer",
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
    },

    {
        name: "Solana_Documentation_Search",
        config: {
            title: "Solana Documentation Search",
            description: "Search documentation across the Solana ecosystem to get the most up to date information.",
            inputSchema: {
                query: z
                    .string()
                    .describe(
                        "A search query that will be matched against a corpus of Solana documentation using RAG"
                    ),
            },
        },
        callback: async ({ query }) => {
            try {
                const solanaMcpClient = await createSolanaMcpClient();

                const response = await solanaMcpClient.client.callTool({ name: "Solana_Documentation_Search", arguments: { query } })

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
                                    error: isAbort ? "Request timed out" : "Failed to fetch Solana documentation search results",
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
    },
];