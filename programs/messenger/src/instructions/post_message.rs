use anchor_lang::prelude::*;

use crate::{events::NewMessageEvent, state::*};

pub fn handler(ctx: Context<PostMessage>, message: String) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    channel.validate()?;

    let aca = &ctx.accounts.associated_channel_account;

    channel.add_message(message.to_owned(), &aca.authority)?;

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(NewMessageEvent {
        channel: channel.key(),
        message,
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct PostMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    #[account(
        mut,
        has_one = channel,
        seeds = [channel.key().as_ref(), sender.key().as_ref()],
        bump,
        constraint = associated_channel_account.cek_key == sender.key()
    )]
    pub associated_channel_account: Account<'info, AssociatedChannelAccount>,
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}
