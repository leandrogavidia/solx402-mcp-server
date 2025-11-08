'use client';

import { useChat } from '@ai-sdk/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Streamdown } from 'streamdown';
import { User, Send, Square, Trash, Info, X, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/spinner';

const WALLET_ADDRESS = 'D5TiA9gpwdXgAc1KcMr6uWLUKBwfAR5xbhAMofda4NcB';
const USDC_DEVNET_ADDRESS = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const DEVNET_RPC = 'https://api.devnet.solana.com';

const tools = [
    {
        name: "get_x402_services",
        description: "Retrieve a list of available x402 services from the facilitator.",
    },
    {
        name: "consume_x402_service",
        description: "Consume a specific x402 service with automatic payment handling.",
    },
    {
        name: "get_facilitators",
        description: "Retrieve a list of available facilitators.",
    },
    {
        name: "search_x402_documentation",
        description: "Search across the x402 documentation to find relevant information.",
    },
    {
        name: "x402_protocol_flow",
        description: "Visual diagram showing the x402 protocol flow and architecture.",
    },
    {
        name: "get_wallet_public_key",
        description: "Retrieve the public key of the configured wallet.",
    },
    {
        name: "get_wallet_usdc_balance",
        description: "Check the USDC token balance of the configured wallet.",
    },
    {
        name: "Ask_Solana_Anchor_Framework_Expert",
        description: "Ask questions about developing on Solana with the Anchor Framework.",
    },
    {
        name: "Solana_Expert__Ask_For_Help",
        description: "A Solana expert that can answer questions about Solana development.",
    },
    {
        name: "Solana_Documentation_Search",
        description: "Search documentation across the Solana ecosystem.",
    },
];

export default function Playground() {
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [tokenBalance, setTokenBalance] = useState<number | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);
    const [usedTools, setUsedTools] = useState<string[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchBalances = async () => {
        try {
            setIsLoadingBalance(true);

            const solResponse = await fetch(DEVNET_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [WALLET_ADDRESS]
                })
            });
            const solData = await solResponse.json();
            if (solData.result?.value !== undefined) {
                setSolBalance(solData.result.value / 1e9)
            }

            const tokenResponse = await fetch(DEVNET_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'getTokenAccountsByOwner',
                    params: [
                        WALLET_ADDRESS,
                        { mint: USDC_DEVNET_ADDRESS },
                        { encoding: 'jsonParsed' }
                    ]
                })
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.result?.value?.length > 0) {
                const accountInfo = tokenData.result.value[0].account.data.parsed.info;
                setTokenBalance(accountInfo.tokenAmount.uiAmount);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const { messages, sendMessage, status, stop, setMessages } = useChat({
        onFinish: () => {
            fetchBalances();
        }
    });

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, status]);

    useEffect(() => {
        const tools = new Set<string>();
        messages.forEach(message => {
            if (message.role === 'assistant') {
                message.parts.forEach(part => {
                    if (part.type === 'tool-call' && 'toolName' in part) {
                        tools.add(String(part.toolName));
                    }
                });
            }
        });
        setUsedTools(Array.from(tools));
    }, [messages]);

    useEffect(() => {
        fetchBalances();
    }, []);

    return (
        <div className="flex w-full max-w-7xl pt-10 pb-4 px-5 mx-auto gap-6 min-h-[calc(100vh-77px)]">
            <aside className={cn(
                "w-80 shrink-0 lg:block",
                isSidebarOpen ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto" : "hidden"
            )}>
                <div className={cn(
                    "space-y-4",
                    isSidebarOpen ? "relative" : "sticky top-24"
                )}>
                    {isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted lg:hidden z-10"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}

                    <div className="border border-border rounded-lg p-6 bg-card">
                        <h2 className='text-xl font-semibold mb-3'>SOLx402 MCP Agent</h2>
                        <p className='text-sm text-muted-foreground mb-4'>This is a demo using NextJS, VERCEL AI SDK, ASI:One LLM and Smithery</p>

                        <div className='flex flex-col gap-3 text-sm'>
                            <div>
                                <p className='font-semibold mb-1'>Wallet Address</p>
                                <code className='bg-muted px-2 py-1 rounded text-xs block break-all'>
                                    {WALLET_ADDRESS}
                                </code>
                            </div>

                            <div>
                                <p className='font-semibold mb-1'>Network</p>
                                <p className='text-muted-foreground'>Devnet</p>
                            </div>

                            <div>
                                <p className='font-semibold mb-1'>Balance</p>
                                {isLoadingBalance ? (
                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                        <Spinner />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <div className='space-y-1'>
                                        <p className='text-muted-foreground'>
                                            <span className='font-medium'>SOL:</span> {solBalance !== null ? `${solBalance.toFixed(4)}` : 'N/A'}
                                        </p>
                                        <p className='text-muted-foreground'>
                                            <span className='font-medium'>USDC:</span> {tokenBalance !== null ? `${tokenBalance.toFixed(6)}` : 'N/A'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className='font-semibold mb-1'>Facilitator URL</p>
                                <p className='text-blue-600 underline'><Link href="https://facilitator.payai.network" target='_blank' rel='noopener noreferrer'>PayAI</Link></p>
                            </div>

                            <div className='pt-3 border-t border-border'>
                                <p className='text-muted-foreground'>
                                    If you want to test your MCP server check the{' '}
                                    <Link href="/#integration" className='text-blue-600 hover:text-blue-800 underline font-medium'>
                                        Integration section
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-6 bg-card">
                        <h2 className='text-xl font-semibold mb-3'>Tools Reference</h2>
                        <p className='text-sm text-muted-foreground mb-4'>Available MCP server tools</p>

                        <div className='space-y-3 text-sm max-h-[340px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50'>
                            {tools.map((tool, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-md border border-border bg-background/50 hover:bg-background transition-colors"
                                >
                                    <div className="flex items-start gap-2 mb-1">
                                        <Code2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                                        <h3 className="font-mono text-xs font-semibold text-foreground break-all">{tool.name}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {usedTools.length > 0 && (
                        <div className="border border-green-500/50 rounded-lg p-6 bg-green-50/50 dark:bg-green-950/20">
                            <h2 className='text-xl font-semibold mb-3 text-green-700 dark:text-green-300'>Tools Used</h2>
                            <p className='text-sm text-muted-foreground mb-4'>Tools called in this conversation</p>

                            <div className='space-y-2 text-sm'>
                                {usedTools.map((toolName, index) => (
                                    <div
                                        key={index}
                                        className="p-2 rounded-md border border-green-200 dark:border-green-800 bg-green-100/50 dark:bg-green-900/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                            <span className="font-mono text-xs font-semibold text-green-700 dark:text-green-300 break-all">
                                                {toolName}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h1 className='text-2xl font-semibold lg:hidden'>SOLx402 MCP Agent</h1>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md border border-border hover:bg-muted"
                            aria-label="Show information"
                        >
                            <Info className="h-5 w-5" />
                        </button>
                    </div>

                    <div 
                        ref={chatContainerRef}
                        className='w-full max-h-[calc(100vh-200px-60px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-gray-800 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500'
                    >
                        <div className="whitespace-pre-wrap flex w-full justify-start items-start gap-3 mb-5">
                            <Image
                                src={'/solana-logo.png'}
                                alt='SOLx402 MCP Server Logo'
                                title='SOLx402 MCP Server Logo'
                                width={225}
                                height={255}
                                className='rounded-md w-10 h-auto'
                            />

                            <p>Hello! I&apos;m the SOLx402 MCP Agent. I can help you interact with x402 services, and answer questions about x402 protocol on Solana. How can I assist you today?</p>
                        </div>

                        <div className='flex flex-col justify-start items-center gap-7 w-full'>
                            {messages.map(({ id, parts, role }) => {
                                console.log('Message:', { id, role, partsCount: parts.length, parts });

                                return (
                                    <div key={id} className={cn("whitespace-pre-wrap flex w-full justify-start items-start gap-3", role === 'user' ? 'flex-row-reverse' : '')}>
                                        {
                                            role === 'user' ? (
                                                <User />
                                            ) : (
                                                <Image
                                                    src={'/solana-logo.png'}
                                                    alt='SOLx402 MCP Server Logo'
                                                    title='SOLx402 MCP Server Logo'
                                                    width={225}
                                                    height={255}
                                                    className='rounded-md w-10 h-auto'
                                                />
                                            )
                                        }
                                        <div className="flex-1">
                                            {parts.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return (
                                                            <Streamdown
                                                                key={`${id}-${i}`}
                                                                isAnimating={status === 'streaming'}
                                                                parseIncompleteMarkdown={true}
                                                                components={{
                                                                    p(props) {
                                                                        return <p className={cn("mb-4 last:mb-0", role === "user" ? "text-end" : "text-left")} {...props} />
                                                                    },
                                                                    a(props) {
                                                                        return <a target="_blank" rel="noopener noreferrer" className="font-semibold cursor-pointer text-blue-600 hover:text-blue-800 underline" {...props} />
                                                                    },
                                                                    ul(props) {
                                                                        return <ul className="flex flex-col justify-center items-start gap-2 list-disc list-inside mb-4" {...props} />
                                                                    },
                                                                    ol(props) {
                                                                        return <ol className="flex flex-col justify-center items-start gap-2 list-decimal list-inside mb-4" {...props} />
                                                                    },
                                                                    h1(props) {
                                                                        return <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />
                                                                    },
                                                                    h2(props) {
                                                                        return <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />
                                                                    },
                                                                    h3(props) {
                                                                        return <h3 className="text-xl font-bold mb-2 mt-4" {...props} />
                                                                    },
                                                                    blockquote(props) {
                                                                        return <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
                                                                    },
                                                                    code(props) {
                                                                        const { className, children, ...rest } = props;
                                                                        const isInline = !className;
                                                                        return isInline ? (
                                                                            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...rest}>
                                                                                {children}
                                                                            </code>
                                                                        ) : (
                                                                            <code className={className} {...rest}>
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    pre(props) {
                                                                        return <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto my-4" {...props} />
                                                                    },
                                                                }}
                                                            >
                                                                {part.text}
                                                            </Streamdown>
                                                        );
                                                    case 'tool-call':
                                                        {
                                                            const toolName = ('toolName' in part && part.toolName) ? String(part.toolName) : 'Unknown Tool';
                                                            const args = 'args' in part ? part.args as Record<string, unknown> : null;
                                                            return (
                                                                <div key={`${id}-${i}`} className="mb-3 p-3 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                                            Calling tool: <code className="font-mono">{toolName}</code>
                                                                        </span>
                                                                    </div>
                                                                    {args && Object.keys(args).length > 0 && (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            <span className="font-medium">Arguments:</span>
                                                                            <pre className="mt-1 p-2 bg-background/50 rounded text-xs overflow-x-auto">
                                                                                {JSON.stringify(args, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    case 'tool-result':
                                                        {
                                                            const toolName = ('toolName' in part && part.toolName) ? String(part.toolName) : 'Unknown Tool';
                                                            const result = 'result' in part ? part.result : null;
                                                            return (
                                                                <div key={`${id}-${i}`} className="mb-3 p-3 rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Code2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                                                            Tool result: <code className="font-mono">{toolName}</code>
                                                                        </span>
                                                                    </div>
                                                                    {result !== null && (
                                                                        <div className="text-xs">
                                                                            <pre className="p-2 bg-background/50 rounded text-xs overflow-x-auto max-h-40">
                                                                                {JSON.stringify(result, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    default:
                                                        if (part.type.startsWith('tool-')) {
                                                            return (
                                                                <div key={`${id}-${i}`} className="mb-3 p-3 rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                                                                    <div className="text-xs">
                                                                        <span className="font-medium">Unknown tool part type: {part.type}</span>
                                                                        <pre className="mt-1 p-2 bg-background/50 rounded text-xs overflow-x-auto">
                                                                            {JSON.stringify(part, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {
                            status === 'submitted' && (
                                <div className="whitespace-pre-wrap flex w-full justify-start items-center gap-3 mb-5">
                                    <Image
                                        src={'/solana-logo.png'}
                                        alt='SOLx402 MCP Server Logo'
                                        title='SOLx402 MCP Server Logo'
                                        width={225}
                                        height={255}
                                        className='rounded-md w-10 h-auto'
                                    />

                                    <div className="flex justify-start items-center gap-3">
                                        <Spinner />
                                        <p>Loading...</p>
                                    </div>
                                </div>
                            )
                        }

                    </div>
                </div>

                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (status === 'streaming' || status === 'submitted') {
                            stop();
                        } else {
                            if (!input.trim()) return;

                            sendMessage({
                                role: 'user',
                                parts: [{ type: 'text', text: input }]
                            });
                            setInput('');
                        }
                    }}
                    className='mt-6 flex gap-3 items-center w-full'
                >
                    <input
                        className="w-full max-w-3xl p-2 border rounded shadow-xl"
                        value={input}
                        placeholder="Say something..."
                        onChange={e => setInput(e.currentTarget.value)}
                        disabled={status === 'submitted' || status === 'streaming'}
                    />
                    <button
                        className='bg-[#111111] hover:opacity-80 transition-all cursor-pointer text-white font-semibold px-4 py-2 rounded shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
                        type='submit'
                    >
                        {
                            status === 'submitted' || status === 'streaming' ? (
                                <Square fill='currentColor' />
                            ) : (
                                <Send />
                            )
                        }
                    </button>
                    <button
                        disabled={status === 'submitted' || status === 'streaming'}
                        onClick={() => {
                            setInput('')
                            setMessages([])
                        }}
                        className='bg-[#111111] hover:opacity-80 transition-all cursor-pointer text-white font-semibold px-4 py-2 rounded shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
                        type='button'
                    >
                        <Trash />
                    </button>
                </form>
            </div>
        </div>
    );
}