use anchor_lang::prelude::*;

use crate::{state::*, MessengerError};

pub fn handler(ctx: Context<AddMeta>, data: AddMetaData) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;

    let meta = &mut ctx.accounts.meta;
    meta.channel = channel.key();
    meta.authority = authority.key();
    meta.key = data.key;
    meta.value = data.value;
    meta.bump = ctx.bumps.meta;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddMetaData {
    pub key: u16,
    pub value: Vec<u8>,
}

#[derive(Accounts)]
#[instruction(data: AddMetaData)]
pub struct AddMeta<'info> {
    pub channel: Box<Account<'info, Channel>>,

    #[account(
        init,
        seeds = [ChannelMeta::SEED, channel.key().as_ref(), authority.key().as_ref(), &data.key.to_le_bytes()],
        bump,
        payer = authority,
        space = ChannelMeta::space(data.value.len())
    )]
    pub meta: Box<Account<'info, ChannelMeta>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
