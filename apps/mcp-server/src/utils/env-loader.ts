import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, "../../.env") });

export const envLoaded = true;