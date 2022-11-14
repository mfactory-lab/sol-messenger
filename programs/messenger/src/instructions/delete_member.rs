use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    events::DeleteMemberEvent,
    state::{Channel, ChannelMembership},
};

pub fn handler(ctx: Context<DeleteMember>) -> Result<()> {
    let authority_membership = &ctx.accounts.authority_membership;
    if !authority_membership.can_delete_member() {
        return Err(MessengerError::Unauthorized.into());
    }

    let channel = &mut ctx.accounts.channel;
    let membership = &ctx.accounts.membership;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    channel.member_count = channel.member_count.saturating_sub(1);

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut, constraint = channel.authorize(authority.key))]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = authority)]
    pub membership: Account<'info, ChannelMembership>,

    #[account(has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ MessengerError::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
