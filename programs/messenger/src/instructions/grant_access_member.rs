use anchor_lang::prelude::*;

use crate::{
    errors::MessengerError,
    state::{Channel, ChannelMembership},
};

pub fn handler(ctx: Context<GrantAccessMember>, data: GrantAccessMemberData) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let authority_key = ctx.accounts.authority.key;
    let authority_membership = &ctx.accounts.authority_membership;

    let is_super_admin = channel.authorize(authority_key);

    if !is_super_admin && !authority_membership.is_owner() {
        msg!("Error: Only the channel owner can grant access");
        return Err(MessengerError::Unauthorized.into());
    }

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let membership = &mut ctx.accounts.membership;
    membership.flags |= data.flags;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct GrantAccessMemberData {
    pub flags: u8,
}

#[derive(Accounts)]
pub struct GrantAccessMember<'info> {
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = authority)]
    pub membership: Account<'info, ChannelMembership>,

    #[account(has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ MessengerError::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
