import { privateKey } from "../config/environment.js";
import {
    createKeyPairFromBytes,
    createSignerFromKeyPair,
    getBase58Encoder
} from "gill";
import { McpLogger } from "../utils/logger.js";

export const createSigner = async () => {
    const keypairBase58 = privateKey;

    try {
        const keypair = await createKeyPairFromBytes(
            getBase58Encoder().encode(keypairBase58)
        );

        const signer = await createSignerFromKeyPair(keypair);
        McpLogger.log(JSON.stringify(signer, null, 2), "Created signer from secret key.");
        McpLogger.log(`Signer Public Key: ${signer.address}`);
        return signer;
    } catch (error) {
        throw new Error("Failed to create wallet from the provided secret key.");
    }
}