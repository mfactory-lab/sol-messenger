use anchor_lang::prelude::*;

use crate::{state::*, MessengerError};

pub fn handler(ctx: Context<ReadMessage>, message_id: u32) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let membership = &mut ctx.accounts.membership;

    if !membership.is_authorized() {
        return Err(MessengerError::Unauthorized.into());
    }

    if message_id > channel.message_count {
        msg!("Error: Invalid message id");
        return Err(MessengerError::Unauthorized.into());
    }

    if message_id < membership.last_read_message_id {
        msg!(
            "Error: The current `last_read_message_id` is greater than {}",
            message_id
        );
        return Err(MessengerError::Unauthorized.into());
    }

    membership.last_read_message_id = message_id;

    Ok(())
}

#[derive(Accounts)]
pub struct ReadMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, has_one = authority)]
    pub membership: Box<Account<'info, ChannelMembership>>,

    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
