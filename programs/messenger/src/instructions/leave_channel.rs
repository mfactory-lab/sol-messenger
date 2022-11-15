use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    events::LeaveChannelEvent,
    state::{Channel, ChannelMembership},
};

pub fn handler(ctx: Context<LeaveChannel>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    channel.member_count = channel.member_count.saturating_sub(1);

    let timestamp = Clock::get()?.unix_timestamp;
    let authority = &ctx.accounts.authority;

    emit!(LeaveChannelEvent {
        channel: channel.key(),
        authority: authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct LeaveChannel<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, has_one = authority, close = authority)]
    pub membership: Box<Account<'info, ChannelMembership>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
