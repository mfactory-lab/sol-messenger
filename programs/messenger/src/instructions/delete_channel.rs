use anchor_lang::prelude::*;

use crate::{
    events::DeleteChannelEvent,
    state::*,
    utils::{assert_valid_membership, close},
    MessengerError,
};

pub fn handler(ctx: Context<DeleteChannel>) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let authority_key = ctx.accounts.authority.key;
    let is_super_admin = channel.authorize(authority_key);

    if !is_super_admin {
        let auth_membership = assert_valid_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        if !auth_membership.is_owner() {
            return Err(MessengerError::Unauthorized.into());
        }
        close(
            ctx.accounts.authority_membership.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        )?;
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
