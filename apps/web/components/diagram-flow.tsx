"use client"

import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function DiagramFlow() {
  return (
    <section id="diagram" className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Architecture Flow</h2>

        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full gap-4 items-center justify-center py-8 px-4">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border-2 border-foreground bg-muted px-6 py-4 text-center">
                <p className="text-sm font-semibold text-foreground">AI Agent</p>
                <p className="text-xs text-muted-foreground">(Claude, ChatGPT, GitHub Copilot, etc)</p>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-foreground shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border-2 border-foreground bg-muted px-6 py-4 text-center">
                <p className="text-sm font-semibold text-foreground">SOLx402</p>
                <p className="text-xs text-muted-foreground">MCP Server</p>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-foreground shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border-2 border-foreground bg-muted px-6 py-4 text-center">
                <p className="text-sm font-semibold text-foreground">Solana</p>
                <p className="text-xs text-muted-foreground">Blockchain</p>
              </div>
            </div>

            <ArrowRight className="h-6 w-6 text-foreground shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border-2 border-foreground bg-muted px-6 py-4 text-center">
                <p className="text-sm font-semibold text-foreground">x402</p>
                <p className="text-xs text-muted-foreground">Payment Protocol</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-2">Step 1: Connect</h3>
            <p className="text-sm text-muted-foreground">AI assistant communicates via MCP protocol</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-2">Step 2: Process</h3>
            <p className="text-sm text-muted-foreground">MCP server handles x402 protocol logic</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-2">Step 3: Execute</h3>
            <p className="text-sm text-muted-foreground">Payments settled on Solana instantly</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-12 text-center mt-12">x402 Flow Diagram</h3>

        <Image src="/x402-protocol-flow.avif" alt="x402 Flow Diagram" className="w-full h-auto" width={840} height={486} />
      </div>
    </section>
  )
}
