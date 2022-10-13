use std::collections::VecDeque;

use anchor_lang::prelude::*;

use crate::{state::*, ErrorCode};

pub fn handler(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
    data.validate()?;

    if !ctx.accounts.channel.to_account_info().data_is_empty() {
        msg!("Error: Attempt to create a channel for an address that is already in use");
        return Err(ErrorCode::AlreadyInUse.into());
    }

    let clock = Clock::get()?;

    let authority = &ctx.accounts.authority;

    let channel = &mut ctx.accounts.channel;
    channel.name = data.name;
    channel.creator = authority.key();
    channel.created_at = clock.unix_timestamp;
    channel.member_count = 1;
    channel.message_count = 0;
    channel.max_messages = data.max_messages;
    channel.messages = VecDeque::with_capacity(data.max_messages as usize);

    // create associated channel account
    let aca = &mut ctx.accounts.aca;
    aca.channel = channel.key();
    aca.authority = authority.key();
    aca.cek_key = data.cek_key.unwrap_or_else(|| authority.key());
    aca.status = ACAStatus::Authorized { by: None };
    aca.cek = data.cek;
    aca.created_at = clock.unix_timestamp;
    aca.bump = ctx.bumps["aca"];

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitChannelData {
    pub name: String,
    pub max_messages: u16,
    pub cek: CEKData,
    pub cek_key: Option<Pubkey>,
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
        space = AssociatedChannelAccount::space()
    )]
    pub aca: Account<'info, AssociatedChannelAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
