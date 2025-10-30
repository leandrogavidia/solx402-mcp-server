import "./utils/env-loader.js";

import { run } from "./server.js";
import { McpLogger } from "./utils/logger.js";

run().catch((err) => {
    McpLogger.error("Fatal error:", String(err));
    process.exit(1);
});