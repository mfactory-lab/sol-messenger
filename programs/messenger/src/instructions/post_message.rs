use anchor_lang::prelude::*;

use crate::{events::NewMessageEvent, state::*, MessengerError};

pub fn handler(ctx: Context<PostMessage>, content: String) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;

    if !channel.is_public() {
        let membership: Account<'_, ChannelMembership> = Account::try_from(&ctx.accounts.membership.to_account_info())?;
        if membership.channel != channel.key() {
            msg!("Error: Invalid membership channel");
            return Err(MessengerError::InvalidMembership.into());
        }
        if membership.authority != authority.key() {
            msg!("Error: Invalid membership authority");
            return Err(MessengerError::InvalidMembership.into());
        }
        if !membership.is_authorized() {
            msg!("Error: Unauthorized membership");
            return Err(MessengerError::Unauthorized.into());
        }
    }

    let message = channel.add_message(content, authority.key)?;

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
