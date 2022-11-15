use anchor_lang::prelude::*;

use crate::{
    events::DeleteChannelEvent,
    state::*,
    utils::{close, validate_membership},
    MessengerError,
};

pub fn handler(ctx: Context<DeleteChannel>) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let authority_key = ctx.accounts.authority.key;
    let is_super_admin = channel.authorize(authority_key);

    if !is_super_admin {
        let auth_membership = validate_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        close(
            auth_membership.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        )?;
        if !auth_membership.is_owner() {
            return Err(MessengerError::Unauthorized.into());
        }
    }

    emit!(DeleteChannelEvent {
        channel: channel.key(),
        creator: channel.creator,
        timestamp: channel.created_at,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteChannel<'info> {
    #[account(mut, close = authority)]
    pub channel: Box<Account<'info, Channel>>,

    /// CHECK:
    #[account(mut)]
    pub authority_membership: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
