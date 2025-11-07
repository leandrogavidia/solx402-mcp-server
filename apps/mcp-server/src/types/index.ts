import type z from "zod";
import type { SessionConfig } from "./config.js";

export interface ToolDefinition {
  name: string;
  config: {
    title: string;
    description: string;
    inputSchema: Record<string, z.ZodTypeAny>;
  }
  callback: (args: any, sessionConfig: SessionConfig) => Promise<{ content: Array<{ type: string; data?: string, mimeType?: string, text?: string }> }>;
}

export type { SessionConfig } from "./config.js";