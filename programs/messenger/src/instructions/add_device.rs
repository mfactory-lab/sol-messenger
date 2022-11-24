use anchor_lang::prelude::*;

use crate::{events::AddDeviceEvent, state::*, MessengerError};

pub fn handler(ctx: Context<AddDevice>, data: AddDeviceData) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;

    let device = &mut ctx.accounts.device;
    device.channel = channel.key();
    device.authority = authority.key();
    device.key = data.key;
    device.cek = data.cek;
    device.bump = ctx.bumps["device"];

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(AddDeviceEvent {
        channel: channel.key(),
        device: device.key(),
        authority: authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddDeviceData {
    pub key: Pubkey,
    pub cek: CEKData,
}

#[derive(Accounts)]
#[instruction(data: AddDeviceData)]
pub struct AddDevice<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel)]
    pub membership: Box<Account<'info, ChannelMembership>>,

    #[account(
        init,
        seeds = [membership.key().as_ref(), data.key.as_ref()],
        bump,
        payer = authority,
        space = ChannelDevice::space()
    )]
    pub device: Box<Account<'info, ChannelDevice>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
