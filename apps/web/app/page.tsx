"use client"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import DiagramFlow from "@/components/diagram-flow"
import ToolsReference from "@/components/tools-reference"
import Integration from "@/components/integration"
import Configuration from "@/components/configuration"
import QueryParameters from "@/components/query-parameters"
import PlaygroundSection from "@/components/playground-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PlaygroundSection />
        <Features />
        <DiagramFlow />
        <ToolsReference />
        <Integration />
        <Configuration />
        <QueryParameters />
      </main>
      <Footer />
    </div>
  )
}
