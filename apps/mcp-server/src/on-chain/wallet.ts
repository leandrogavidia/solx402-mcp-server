import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { base58 } from "@scure/base";
import { createKeyPairSignerFromBytes } from "@solana/kit";

export const getkeypair = (privateKey: string) => {
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    return keypair
}

export const getSigner = async (privateKey: string) => {
    try {
        const signer = await createKeyPairSignerFromBytes(
            base58.decode(privateKey)
        );

        return signer
    } catch (e) {
        console.error("Error creating signer from PRIVATE_KEY:", e);
        throw e;
    }
}