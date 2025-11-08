import { asiProvider } from '@/lib/ai/asi-provider';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY || '';
const SMITHERY_PROFILE = process.env.SMITHERY_PROFILE || '';

if (!SMITHERY_API_KEY || !SMITHERY_PROFILE) {
    throw new Error('SMITHERY_API_KEY and SMITHERY_PROFILE must be set in environment variables.');
}

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const systemPrompt = `
    You are SOLx402 MCP Agent.
    You help users interact with the x402 payment protocol on Solana.
    You have access to various tools to assist users with payments, transactions, and account management.
    Always prioritize user security and privacy.
    Provide clear and concise responses.
    Use always the tools when necessary.
    return always the links.
    If use the x402_protocol_flow tool function, please return the image with the sintax ![alt text](image_url)
    `

    const url = new URL(`https://server.smithery.ai/@leandrogavidia/solx402-mcp-server/mcp?api_key=${SMITHERY_API_KEY}&profile=${SMITHERY_PROFILE}`);

    const mcpClient = await createMCPClient({
        transport: new StreamableHTTPClientTransport(url, {
            sessionId: 'session_123',
        }),
    });

    try {
        const tools = await mcpClient.tools();
        const usedToolNames: string[] = [];

        const result = streamText({
            model: asiProvider.languageModel('asi1-mini'),
            system: systemPrompt,
            tools,
            messages: convertToModelMessages(messages),
            maxOutputTokens: 4096,
            maxRetries: 3,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopWhen: [stepCountIs(5)],
            onStepFinish: ({ toolCalls }) => {
                if (toolCalls) {
                    toolCalls.forEach((toolCall) => {
                        if (!usedToolNames.includes(toolCall.toolName)) {
                            usedToolNames.push(toolCall.toolName);
                        }
                    });
                }
            },
            onFinish: async () => {
                await mcpClient.close();
            },
        });

        return result.toUIMessageStreamResponse({
            headers: {
                'X-Tool-Names': JSON.stringify(usedToolNames),
            },
        });
    } catch (err) {
        console.error('Error in MCP route:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}