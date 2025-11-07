"use client"

import { Code2, FileJson } from "lucide-react"

const tools = [
  {
    name: "get_x402_services",
    description: "Retrieve a list of available x402 services from the facilitator.",
    params: ["facilitatorUrl", "limit"],
    returns: "Array of service objects with details",
  },
  {
    name: "consume_x402_service",
    description: "Consume a specific x402 service with automatic payment handling.",
    params: ["x402ServiceUrl"],
    returns: "Service response data",
  },
  {
    name: "get_facilitators",
    description: "Retrieve a list of available facilitators.",
    params: [],
    returns: "Array of facilitator objects with details",
  },
  {
    name: "search_x402_documentation",
    description: "Search across the x402 documentation to find relevant information, code examples, API references, and guides.",
    params: ["query"],
    returns: "Search results with relevant documentation snippets",
  },
  {
    name: "x402_protocol_flow",
    description: "Visual diagram showing the x402 protocol flow and architecture.",
    params: [],
    returns: "URL to the protocol flow diagram image",
  },
  {
    name: "get_wallet_public_key",
    description: "Retrieve the public key of the configured wallet.",
    params: [],
    returns: "Wallet public key",
  },
  {
    name: "get_wallet_usdc_balance",
    description: "Check the USDC token balance of the configured wallet.",
    params: [],
    returns: "Wallet USDC balance",
  },
  {
    name: "Ask_Solana_Anchor_Framework_Expert",
    description: "Ask questions about developing on Solana with the Anchor Framework.",
    params: ["question"],
    returns: "Expert guidance on Solana Anchor development",
  },
  {
    name: "Solana_Expert__Ask_For_Help",
    description: "A Solana expert that can answer questions about Solana development.",
    params: ["question"],
    returns: "Expert answers on Solana development",
  },
  {
    name: "Solana_Documentation_Search",
    description: "Search documentation across the Solana ecosystem to get the most up to date information.",
    params: ["query"],
    returns: "Search results with relevant Solana documentation snippets",
  },
]

export default function ToolsReference() {
  return (
    <section id="tools" className="px-4 py-20 sm:px-6 lg:px-8 bg-card">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-foreground mb-4 text-center">Tools Reference</h2>
        <p className="text-center text-muted-foreground mb-12">Core tools available in the MCP server</p>

        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-background hover:border-accent transition-all p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-foreground" />
                    <h3 className="font-mono text-lg font-semibold text-foreground">{tool.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">{tool.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Parameters</p>
                      <div className="space-y-1">
                        {tool.params.map((param) => (
                          <code key={param} className="block text-foreground">
                            {param}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Returns</p>
                      <p className="text-foreground">{tool.returns}</p>
                    </div>
                  </div>
                </div>
                <FileJson className="h-8 w-8 text-muted shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
