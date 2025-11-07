import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "SOLx402 MCP Server",
  description: "SOLx402 MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to interact with the x402 payment protocol on Solana.",
  generator: "Next.js",
  keywords: ["solana", "sol ai", "blinks", "ai", "hackathons"],
  icons: [
    { rel: "apple-touch-icon", url: "/images/brand/sol-ai-logo.png" },
    { rel: "icon", url: "/images/brand/sol-ai-logo.png" },
  ],
  twitter: {
    card: "summary_large_image",
    site: "@androgavidia",
    creator: "@androgavidia",
    title: "SOLx402 MCP Server",
    description: "SOLx402 MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to interact with the x402 payment protocol on Solana.",
    images: {
      url: "/solx402-open-graph.png",
      alt: "SOLx402 MCP Server",
      username: "@androgavidia",
      width: 1920,
      height: 1080,
      type: "image/png",
    },
  },
  openGraph: {
    title: "SOLx402 MCP Server",
    description: "SOLx402 MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to interact with the x402 payment protocol on Solana.",
    url: "https://sol-ai.app/",
    type: "website",
    locale: "en",
    siteName: "SOLx402 MCP Server",
    images: {
      url: "/solx402-open-graph.png",
      alt: "SOLx402 MCP Server",
      width: 1920,
      height: 1080,
      type: "image/png",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
