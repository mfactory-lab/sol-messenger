use anchor_lang::prelude::*;

use crate::{state::*, MessengerError};

pub fn handler(ctx: Context<DeleteMeta>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;
    let meta = &ctx.accounts.meta;
    let meta_authority = &ctx.accounts.meta_authority;
    let is_super_admin = channel.authorize(authority.key);

    if !is_super_admin && meta.authority.key() != meta_authority.key() {
        return Err(MessengerError::Unauthorized.into());
    }

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMeta<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = meta_authority)]
    pub meta: Box<Account<'info, ChannelMeta>>,

    /// CHECK:
    #[account(mut)]
    pub meta_authority: AccountInfo<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
