import "../utils/env-loader.js";

export const useStreamHttp = process.env.USE_STREAMABLE_HTTP === "true";
export const port = Number(process.env.PORT || 3000);
export const host = process.env.HOST || "127.0.0.1";
export const isMainnet = process.env.IS_MAINNET === "true";

export const facilitatorUrl = process.env.FACILITATOR_URL as `${string}://${string}` || "https://facilitator.payai.network" // https://facilitator.payai.network/
export const maxPrice = Number(process.env.MAX_PRICE || 0);