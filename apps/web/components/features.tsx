"use client"

import { Zap, Coins, Rocket } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "AI Integration",
    description: "Seamlessly integrate AI assistants with the x402 payment protocol through Model Context Protocol.",
  },
  {
    icon: Coins,
    title: "x402 Protocol",
    description: "Discover and consume x402-enabled services with automated payment handling.",
  },
  {
    icon: Rocket,
    title: "Developer Ready",
    description: "Simple configuration and easy integration into Claude, Cursor, VS Code, and more.",
  },
]

export default function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-card">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-border bg-background hover:border-accent transition-all"
              >
                <div className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-muted p-3">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
