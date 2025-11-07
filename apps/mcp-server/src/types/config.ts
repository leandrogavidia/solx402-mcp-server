import type z from "zod";
import type { configSchema } from "../server.js";

export type SessionConfig = z.infer<typeof configSchema>;
