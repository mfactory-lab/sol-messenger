use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    events::DeleteMemberEvent,
    state::{Channel, ChannelMembership},
    utils::{assert_valid_device, assert_valid_membership, close},
};

pub fn handler<'info>(ctx: Context<'_, '_, 'info, 'info, DeleteMember<'info>>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;
    let is_super_admin = channel.authorize(authority.key);

    if !is_super_admin {
        let auth_membership = assert_valid_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority.key,
        )?;
        if !auth_membership.is_authorized() || !auth_membership.can_delete_member(channel) {
            return Err(MessengerError::Unauthorized.into());
        }
    }

    channel.member_count = channel.member_count.saturating_sub(1);

    let membership = &ctx.accounts.membership;
    let membership_authority = &ctx.accounts.membership_authority;

    // delete devices
    if !ctx.remaining_accounts.is_empty() {
        for acc in ctx.remaining_accounts {
            assert_valid_device(acc, &membership.channel, &membership.authority)?;
            close(acc.to_account_info(), membership_authority.to_account_info())?;
        }
    }

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        authority: membership_authority.key(),
        by: authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut,
        has_one = channel,
        constraint = membership.authority == membership_authority.key(),
        close = membership_authority,
    )]
    pub membership: Account<'info, ChannelMembership>,

    /// CHECK:
    #[account(mut)]
    pub membership_authority: AccountInfo<'info>,

    /// CHECK:
    pub authority_membership: AccountInfo<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
