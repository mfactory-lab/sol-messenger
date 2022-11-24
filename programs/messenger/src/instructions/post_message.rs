use anchor_lang::prelude::*;

use crate::{events::NewMessageEvent, state::*, utils::assert_valid_membership, MessengerError};

pub fn handler(ctx: Context<PostMessage>, content: String) -> Result<()> {
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
            return Err(MessengerError::Unauthorized.into());
        }
    }

    let message = channel.add_message(content, authority_key)?;

    emit!(NewMessageEvent {
        channel: channel.key(),
        message,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct PostMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    /// CHECK:
    pub membership: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
