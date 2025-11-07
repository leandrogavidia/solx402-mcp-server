"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    step: 1,
    title: "Visit Smithery",
    description: "Go to the SOLx402 MCP Server Smithery page",
  },
  {
    step: 2,
    title: "Sign In",
    description: "Authenticate with your account",
  },
  {
    step: 3,
    title: "Configure",
    description: "Fill in required fields and optional configurations",
  },
  {
    step: 4,
    title: "Generate URL",
    description: "Create MCP server URL with your API key",
  },
  {
    step: 5,
    title: "Integrate",
    description: "Add URL to Claude, Cursor, VS Code, or other clients",
  },
]

export default function Integration() {
  return (
    <section id="integration" className="px-4 py-20 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-foreground mb-4 text-center">Integration Steps</h2>
        <p className="text-center text-muted-foreground mb-12">Get started in 5 simple steps</p>

        <div className="space-y-4 mb-12">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex gap-6 rounded-lg border border-border bg-card hover:border-accent transition-all p-6"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white shrink-0 font-bold text-lg"
                style={{ backgroundColor: "rgb(255, 50, 0)" }}
              >
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-foreground shrink-0 self-center" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(255, 50, 0)" }}>
                Ready to integrate?
              </h3>
              <p className="text-muted-foreground">Access the Smithery page to configure your MCP server</p>
            </div>

            <Link href="https://smithery.ai/server/@leandrogavidia/solx402-mcp-server" target="_blank" rel="noopener noreferrer">
              <Button
                className="whitespace-nowrap border-0 text-white"
                style={{ backgroundColor: "rgb(255, 50, 0)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(220, 40, 0)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgb(255, 50, 0)")}
              >
                Go to Smithery
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
