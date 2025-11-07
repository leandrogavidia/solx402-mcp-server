"use client"

import { Database } from "lucide-react"

const parameters = [
  {
    name: "privateKey",
    type: "string",
    required: true,
    description: "Base58-encoded private key for your Solana wallet",
  },
  {
    name: "mainnetRpcUrl",
    type: "string",
    required: true,
    description: "Solana RPC URL for mainnet operations",
  },
  {
    name: "isMainnet",
    type: "boolean",
    required: false,
    description: "Set to true for mainnet, false for devnet (Default: false)",
  },
  {
    name: "facilitatorUrl",
    type: "string",
    required: false,
    description: "URL of the x402 facilitator (default: PayAI Facilitator URL)",
  },
  {
    name: "maxPrice",
    type: "number",
    required: false,
    description: "Maximum price to pay for services in USDC microcents, e.g. 10000 = 0.01 USDC (default: 0)",
  },
  {
    name: "useSolanaMcpServer",
    type: "boolean",
    required: false,
    description: "Enable Solana development tools integration (default: false)",
  },
]

export default function QueryParameters() {
  return (
    <section id="params" className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-foreground mb-4 text-center">Query Parameters</h2>
        <p className="text-center text-muted-foreground mb-12">Detailed reference for all available parameters</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Database className="h-4 w-4" />
                    Parameter
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-foreground font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-foreground font-semibold">Required</th>
                <th className="px-6 py-4 text-left text-foreground font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parameters.map((param, index) => (
                <tr key={index} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-foreground font-mono">{param.name}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                      {param.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${param.required ? "bg-muted text-foreground" : "bg-border text-muted-foreground"
                        }`}
                    >
                      {param.required ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs">{param.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
