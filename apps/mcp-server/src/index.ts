import "./utils/env-loader.js";

import { run } from "./server.js";

run().catch((err) => {
    console.error("Fatal error:", String(err));
    process.exit(1);
});