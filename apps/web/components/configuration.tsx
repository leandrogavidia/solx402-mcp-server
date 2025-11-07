"use client"

import { AlertCircle, Clock } from "lucide-react"

export default function Configuration() {
    return (
        <section id="config" className="px-4 py-20 sm:px-6 lg:px-8 bg-card">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-4xl font-bold text-foreground mb-4 text-center">⚠️ Important: Request Timeout Configuration</h2>
                <p className="text-center text-muted-foreground mb-12">
                    <strong>Critical Setup Requirement</strong> for successful x402 service consumption
                </p>

                <div className="mb-12 rounded-lg border-2 bg-destructive/5 p-6 border-yellow-500">
                    <div className="flex gap-3">
                        <AlertCircle className="h-8 w-8 text-yellow-500 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-yellow-500 mb-4">Minimum Request Timeout Required</h3>
                            <div className="bg-yellow-500/10 p-4 rounded-lg mb-4">
                                <p className="text-lg font-semibold text-foreground mb-2">
                                    Configure your MCP client with a <strong>minimum request timeout of 60,000ms (60 seconds)</strong>
                                </p>
                            </div>
                            <div className="space-y-3 text-sm text-foreground">
                                <p><strong>Why This Matters:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>x402 services are external APIs that may require significant processing time</li>
                                    <li>Payment transactions are executed on the Solana blockchain, which can take time to confirm</li>
                                    <li>Short timeouts can cause requests to fail <strong>after</strong> USDC has been charged, resulting in payment without receiving the service</li>
                                    <li>By default, MCP servers use a maximum request timeout of 10 seconds, which is insufficient for x402 operations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="rounded-lg border border-border bg-background p-6">
                            <div className="flex gap-3">
                                <Clock className="h-6 w-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Recommended: 60+ seconds</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Minimum timeout for x402 service consumption to handle blockchain confirmations and external API processing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-6">
                            <div className="flex gap-3">
                                <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Default MCP Timeout: 10s</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Standard MCP server timeout is too short for blockchain operations and may cause payment issues.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border border-border bg-background p-6">
                            <h3 className="font-semibold text-foreground mb-4">Potential Issues with Short Timeouts</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-yellow-500 font-medium mb-1">💰 Payment Without Service</p>
                                    <p className="text-muted-foreground">
                                        USDC may be charged but service request fails due to timeout
                                    </p>
                                </div>
                                <div>
                                    <p className="text-yellow-500 font-medium mb-1">🔄 External API Processing</p>
                                    <p className="text-muted-foreground">
                                        x402 services may need additional time for complex operations
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-6">
                            <h3 className="font-semibold text-foreground mb-4">Configuration Example</h3>
                            <pre className="text-xs text-foreground overflow-x-auto bg-muted p-3 rounded font-mono">
                                {`// MCP Client Configuration
{
  "mcpServers": {
    "solx402": {
      "url": "https://server.smithery.ai/@leandrogavidia/solx402-mcp-server/mcp?api_key=<YOUR-SMITHERY-API-KEY>&profile=<YOUR-SMITHERY-PROFILE>",
      "type": "streamable-http",
      "timeout": 120000 // 2 Minutes
    }
  }
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
