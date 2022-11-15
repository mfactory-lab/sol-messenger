use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    events::DeleteMemberEvent,
    state::{Channel, ChannelMembership},
    utils::validate_membership,
};

pub fn handler(ctx: Context<DeleteMember>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority_key = ctx.accounts.authority.key;
    let is_super_admin = channel.authorize(authority_key);

    if !is_super_admin {
        let auth_membership = validate_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        if !auth_membership.is_authorized() || !auth_membership.can_delete_member(channel) {
            return Err(MessengerError::Unauthorized.into());
        }
    }

    channel.member_count = channel.member_count.saturating_sub(1);

    let membership = &ctx.accounts.membership;
    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        by: *authority_key,
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = authority)]
    pub membership: Account<'info, ChannelMembership>,

    /// CHECK:
    pub authority_membership: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
