import "../utils/env-loader.js";

export const port = Number(process.env.PORT || 8001);
export const host = process.env.HOST || "127.0.0.1";