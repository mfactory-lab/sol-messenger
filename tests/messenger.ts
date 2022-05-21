import * as anchor from "@project-serum/anchor";
import { Messenger } from "../target/types/messenger";
import { generateCEK, decryptCEK, encryptCEK, encryptMessage, decryptMessage } from "../app/crypto";
import * as assert from "assert";

describe("messenger", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.Messenger as anchor.Program<Messenger>;

    // const sender = anchor.web3.Keypair.generate();
    const sender = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            96, 255, 91, 60, 84, 34, 32, 0, 115, 218, 156, 246, 56, 44, 70, 197, 193, 3, 46, 45, 156,
            192, 45, 144, 179, 247, 90, 255, 131, 147, 185, 134, 13, 63, 43, 161, 221, 53, 226, 96, 188,
            0, 206, 186, 41, 92, 58, 122, 88, 152, 223, 117, 36, 228, 184, 181, 183, 90, 249, 13, 181,
            170, 100, 225,
        ]),
    );

    // Airdrop some lamports first
    before(async () => {
        await anchor.getProvider().connection.confirmTransaction(
            await anchor.getProvider().connection.requestAirdrop(
                sender.publicKey,
                anchor.web3.LAMPORTS_PER_SOL * 10,
            ),
            "confirmed"
        );
    });

    let channel = anchor.web3.Keypair.generate();
    let invitee = anchor.web3.Keypair.generate();

    console.log("Program ID: " + program.programId.toBase58());
    console.log("Channel ID: " + channel.publicKey.toBase58());
    console.log("Sender: " + sender.publicKey.toBase58());

    it("init channel", async () => {

        const [associatedChannelAccount] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            sender.publicKey.toBuffer(),
        ], program.programId));

        const cek = await generateCEK();
        const encCEK = await encryptCEK(cek, sender.publicKey);

        console.log("CEK: " + cek);

        // @ts-ignore
        await program.methods.initChannel({
            name: 'test',
            maxMessages: 10,
            cek: encCEK,
        })
            .accounts({
                channel: channel.publicKey,
                authority: sender.publicKey,
                associatedChannelAccount
            })
            .signers([channel, sender])
            .rpc();

        const channelInfo = await program.account.channel.fetch(channel.publicKey);

        assert.equal(channelInfo.name, 'test');
        assert.equal(channelInfo.maxMessages, 10);
        assert.equal(channelInfo.authority.toBase58(), sender.publicKey.toBase58());

        const acaInfo = await program.account.associatedChannelAccount.fetch(associatedChannelAccount);

        assert.equal(acaInfo.channel.toBase58(), channel.publicKey.toBase58());
        assert.equal(acaInfo.owner.toBase58(), sender.publicKey.toBase58());
        assert.equal(acaInfo.cek.encryptedKey, encCEK.encryptedKey);

    });

    it("post message", async () => {
        const [associatedChannelAccount] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            sender.publicKey.toBuffer(),
        ], program.programId));

        let aca = await program.account.associatedChannelAccount.fetch(associatedChannelAccount);

        const cek = await decryptCEK(aca.cek, sender.secretKey);

        const message = 'hello world';
        const encMessage = await encryptMessage(message, cek);

        await program.methods.postMessage(encMessage)
            .accounts({
                channel: channel.publicKey,
                sender: sender.publicKey,
                associatedChannelAccount,
            })
            .signers([sender])
            .rpc();

        let channelInfo = await program.account.channel.fetch(channel.publicKey);

        assert.equal(channelInfo.messages[0].content, encMessage);
    });

    it("add to channel", async () => {
        const [inviterAca] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            sender.publicKey.toBuffer(),
        ], program.programId));

        let aca = await program.account.associatedChannelAccount.fetch(inviterAca);

        const cek = await decryptCEK(aca.cek, sender.secretKey);

        const [inviteeAca] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            invitee.publicKey.toBuffer(),
        ], program.programId));

        const encCEK = await encryptCEK(cek, invitee.publicKey);

        // @ts-ignore
        await program.methods.addToChannel({ cek: encCEK })
            .accounts({
                channel: channel.publicKey,
                inviter: sender.publicKey,
                inviterAca,
                invitee: invitee.publicKey,
                inviteeAca,
            })
            .signers([sender])
            .rpc();

        const channelInfo = await program.account.channel.fetch(channel.publicKey);

        assert.equal(channelInfo.memberCount, 2);
    });

    it("post message from invitee", async () => {
        const [associatedChannelAccount] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            invitee.publicKey.toBuffer(),
        ], program.programId));

        let aca = await program.account.associatedChannelAccount.fetch(associatedChannelAccount);

        const cek = await decryptCEK(aca.cek, invitee.secretKey);

        const message = 'hello from invitee';
        const encMessage = await encryptMessage(message, cek);

        await program.methods.postMessage(encMessage)
            .accounts({
                channel: channel.publicKey,
                sender: invitee.publicKey,
                associatedChannelAccount,
            })
            .signers([invitee])
            .rpc();

        let channelInfo = await program.account.channel.fetch(channel.publicKey);

        assert.equal((channelInfo.messages as Array<any>).length, 2);
    })

    it("read message from inviter", async () => {
        const [associatedChannelAccount] = (await anchor.web3.PublicKey.findProgramAddress([
            channel.publicKey.toBuffer(),
            sender.publicKey.toBuffer(),
        ], program.programId));

        const aca = await program.account.associatedChannelAccount.fetch(associatedChannelAccount);
        const cek = await decryptCEK(aca.cek, sender.secretKey);
        const channelInfo = await program.account.channel.fetch(channel.publicKey);
        const message = await decryptMessage(channelInfo.messages[1].content, cek);

        assert.equal(message, 'hello from invitee');
    });
});
