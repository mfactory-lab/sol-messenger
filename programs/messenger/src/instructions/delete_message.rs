use anchor_lang::prelude::*;

use crate::{events::DeleteMessageEvent, state::*, utils::assert_valid_membership, MessengerError};

pub fn handler(ctx: Context<DeleteMessage>, id: u64) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority_key = ctx.accounts.authority.key;

    if !channel.is_public() {
        let membership = assert_valid_membership(
            &ctx.accounts.membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        if !membership.is_authorized() {
            msg!("Error: Not a member");
            return Err(MessengerError::Unauthorized.into());
        }
    }

    let idx = channel
        .messages
        .iter()
        .position(|m| m.id == id && m.sender == *authority_key)
        .ok_or(MessengerError::Unauthorized)?;

    channel.messages.remove(idx);

    emit!(DeleteMessageEvent {
        channel: channel.key(),
        authority: *authority_key,
        id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    /// CHECK:
    pub membership: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
