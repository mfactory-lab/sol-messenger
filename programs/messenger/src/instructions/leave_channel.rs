use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    events::LeaveChannelEvent,
    state::*,
    utils::{assert_valid_device, close},
};

pub fn handler<'info>(ctx: Context<'_, '_, 'info, 'info, LeaveChannel<'info>>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;
    let authority = &ctx.accounts.authority;

    // delete devices
    if !ctx.remaining_accounts.is_empty() {
        for acc in ctx.remaining_accounts {
            assert_valid_device(acc, &channel.key(), authority.key)?;
            close(acc.to_account_info(), authority.to_account_info())?;
        }
    }

    channel.member_count = channel.member_count.saturating_sub(1);

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
