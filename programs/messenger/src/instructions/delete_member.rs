use anchor_lang::prelude::*;

use crate::{events::DeleteMemberEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<DeleteMember>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    let authority = &ctx.accounts.authority;
    let membership = &ctx.accounts.membership;

    if membership.authority.key() == authority.key() {
        return Err(ErrorCode::Unauthorized.into());
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
    #[account(mut, constraint = channel.creator.key() == authority.key())]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = authority)]
    pub membership: Account<'info, ChannelMembership>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ ErrorCode::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    pub system_program: Program<'info, System>,
}
