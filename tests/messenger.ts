import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
// import { Messenger } from "../target/types/messenger";
import { generateCEK, decryptCEK, encryptCEK, encryptMessage } from "../app/crypto";
import { Keypair } from "@solana/web3.js";

describe("messenger", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    // const program = anchor.workspace.Messenger as Program<Messenger>;

    it("encrypt", async () => {
        const key1 = Keypair.generate();
        const key2 = Keypair.generate();

        const message = "a".repeat(32);
        const cek = await generateCEK();

        const encMessage = await encryptMessage(message, cek);

        console.log(encMessage);
        console.log([message.length, encMessage.length]);

        // const key1CEK = await encryptCEK(cek, key1.publicKey);
        // const key2CEK = await encryptCEK(cek, key2.publicKey);
        //
        // const dec1CEK = await decryptCEK(key1CEK, key1.secretKey);
        // const dec2CEK = await decryptCEK(key2CEK, key2.secretKey);
        //
        // console.log('dec1CEK', dec1CEK);
        // console.log('dec2CEK', dec2CEK);

    });

    // it("Is initialized!", async () => {
    //   // Add your test here.
    //   const tx = await program.methods.initialize().rpc();
    //   console.log("Your transaction signature", tx);
    // });
});
