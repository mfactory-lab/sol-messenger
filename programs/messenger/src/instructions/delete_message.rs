use anchor_lang::prelude::*;

use crate::{events::DeleteMessageEvent, state::*, MessengerError};

pub fn handler(ctx: Context<DeleteMessage>, id: u64) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let membership = &mut ctx.accounts.membership;

    if !membership.is_authorized() {
        return Err(MessengerError::Unauthorized.into());
    }

    let idx = channel
        .messages
        .iter()
        .position(|m| m.id == id && m.sender == membership.authority);

    match idx {
        None => {
            return Err(MessengerError::Unauthorized.into());
        }
        Some(idx) => {
            channel.messages.remove(idx);
        }
    }

    emit!(DeleteMessageEvent {
        channel: channel.key(),
        authority: membership.authority,
        id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, has_one = authority)]
    pub membership: Box<Account<'info, ChannelMembership>>,

    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
