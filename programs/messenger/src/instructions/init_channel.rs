use crate::{error::ErrorCode, state::*};
use anchor_lang::{prelude::*, solana_program::program_pack::IsInitialized};

pub fn handler(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
    if data.name.len() > MAX_CHANNEL_NAME_LENGTH {
        return Err(ErrorCode::NameTooLong.into());
    }

    let channel = &mut ctx.accounts.channel;

    if channel.is_initialized() {
        msg!("Error: Attempt to create a channel for an address that is already in use");
        return Err(ErrorCode::AlreadyInUse.into());
    }

    let clock = Clock::get().unwrap();

    channel.name = data.name;
    channel.authority = *ctx.accounts.authority.key;
    channel.created_at = clock.unix_timestamp;
    channel.max_messages = data.max_messages;
    channel.messages = Vec::with_capacity(data.max_messages as usize);
    channel.member_count = 1;

    // create associated channel account

    let aca = &mut ctx.accounts.associated_channel_account;

    // if !aca.to_account_info().data.borrow().is_empty() {
    //     msg!("Error: Associated channel account already exists");
    //     return Err(ErrorCode::AlreadyInUse.into());
    // }

    aca.channel = channel.key();
    aca.owner = *ctx.accounts.authority.key;
    aca.created_at = clock.unix_timestamp;
    aca.cek = data.cek;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitChannelData {
    pub name: String,
    pub max_messages: u16,
    pub cek: CEKData,
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
    pub associated_channel_account: Account<'info, AssociatedChannelAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
