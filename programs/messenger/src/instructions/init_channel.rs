use anchor_lang::prelude::*;

use crate::{events::NewChannelEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
    data.validate()?;

    // if !ctx.accounts.channel.to_account_info().data_is_empty() {
    //     msg!("Error: Attempt to create a channel for an address that is already in use");
    //     return Err(ErrorCode::AlreadyInUse.into());
    // }

    let clock = Clock::get()?;

    let authority = &ctx.accounts.authority;

    let channel = &mut ctx.accounts.channel;
    channel.name = data.name.to_owned();
    channel.creator = authority.key();
    channel.member_count = 1;
    channel.message_count = 0;
    channel.max_messages = data.max_messages;
    channel.messages = Vec::with_capacity(data.max_messages as usize);
    channel.created_at = clock.unix_timestamp;

    // create associated channel account
    let membership = &mut ctx.accounts.membership;
    membership.channel = channel.key();
    membership.authority = authority.key();
    membership.key = ctx.accounts.key.key();
    membership.cek = data.cek;
    membership.status = ChannelMembershipStatus::Authorized { by: None };
    membership.created_at = clock.unix_timestamp;
    membership.bump = ctx.bumps["membership"];

    emit!(NewChannelEvent {
        channel: channel.key(),
        creator: channel.creator,
        name: data.name,
        timestamp: channel.created_at,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitChannelData {
    pub name: String,
    pub max_messages: u16,
    pub cek: CEKData,
}

impl InitChannelData {
    pub fn validate(&self) -> Result<()> {
        if self.name.len() > MAX_CHANNEL_NAME_LENGTH {
            return Err(ErrorCode::NameTooLong.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    data: InitChannelData,
)]
pub struct InitChannel<'info> {
    #[account(
        init,
        payer = authority,
        space = Channel::space(data.max_messages),
    )]
    channel: Box<Account<'info, Channel>>,

    #[account(
        init,
        seeds = [channel.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = ChannelMembership::space()
    )]
    pub membership: Account<'info, ChannelMembership>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub key: Signer<'info>,

    pub system_program: Program<'info, System>,
}
