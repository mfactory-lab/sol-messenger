use anchor_lang::prelude::*;

use crate::{events::DeleteChannelEvent, state::*};

pub fn handler(ctx: Context<DeleteChannel>) -> Result<()> {
    let channel = &ctx.accounts.channel;

    emit!(DeleteChannelEvent {
        channel: channel.key(),
        creator: channel.creator,
        timestamp: channel.created_at,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteChannel<'info> {
    #[account(mut, close = authority, constraint = channel.creator.key() == authority.key())]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, close = authority, has_one = channel, has_one = authority)]
    pub authority_membership: Account<'info, ChannelMembership>,

    pub system_program: Program<'info, System>,
}
