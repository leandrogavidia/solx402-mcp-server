"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-block rounded-full border border-border bg-muted px-4 py-2 mb-6">
          <p className="text-sm font-medium text-foreground">AI-Powered x402 Integration</p>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">SOLx402 MCP Server</h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Model Context Protocol server enabling AI assistants to interact with the x402 payment protocol on Solana.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="https://github.com/leandrogavidia/solx402-mcp-server" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="cursor-pointer border-border text-foreground hover:text-foreground hover:bg-muted px-8 bg-transparent"
              size="lg"
            >
              GitHub Repo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 pt-8 border-t border-border">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">AI-Native</div>
            <p className="text-sm text-muted-foreground">Native MCP Protocol</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">Solana</div>
            <p className="text-sm text-muted-foreground">x402 Integration</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">Instant</div>
            <p className="text-sm text-muted-foreground">USDC Payments</p>
          </div>
        </div>
      </div>
    </section>
  )
}
