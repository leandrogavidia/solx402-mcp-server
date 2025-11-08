"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function PlaygroundSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg border border-border bg-background p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/smithery-logo.svg" className="w-32 h-auto" alt="Smithery Logo" width={24} height={24}  />

              <h3 className="text-2xl font-bold text-foreground">Playground</h3>
            </div>
            <p className="text-muted-foreground mb-6">Test and interact with the SOLx402 MCP server in Smithery&apos;s visual playground environment</p>
            <div className="flex-1 rounded-lg border-2 border-border bg-muted overflow-hidden mb-6 flex items-center justify-center min-h-64 ">
              <Image src="/smithery-playground.jpg" alt="Smithery Playground" className="w-full h-auto" width={1920} height={1080} />
            </div>
            <Link href="https://smithery.ai/chat?mcp=@leandrogavidia/solx402-mcp-server" target="_blank" rel="noopener noreferrer">
                <Button className="cursor-pointer w-full bg-[rgb(255,50,0)] hover:bg-[rgb(200,40,0)] text-white">
                    Open Smithery Playground
                </Button>
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-background p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-2xl font-bold text-foreground">NextJS Playground</h3>
            </div>
            <p className="text-muted-foreground mb-6">Test and interact with the SOLx402 MCP server in NextJS&apos;s visual playground environment</p>
            <div className="flex-1 rounded-lg border-2 border-border bg-muted overflow-hidden mb-6 flex items-center justify-center min-h-64 ">
              <Image src="/next-js-playground.jpg" alt="Smithery Playground" className="w-full h-auto" width={1920} height={1080} />
            </div>
            <Link href="/playground">
                <Button className="cursor-pointer w-full bg-black hover:bg-[rgb(50,50,50)] text-white">
                    Open Playground
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
