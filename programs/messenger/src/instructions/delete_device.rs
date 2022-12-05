use anchor_lang::prelude::*;

use crate::{events::DeleteDeviceEvent, state::*, MessengerError};

pub fn handler(ctx: Context<DeleteDevice>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority = &ctx.accounts.authority;
    let device = &ctx.accounts.device;
    let device_authority = &ctx.accounts.device_authority;
    let is_super_admin = channel.authorize(authority.key);

    if !is_super_admin && device.authority.key() != device_authority.key() {
        return Err(MessengerError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteDeviceEvent {
        channel: channel.key(),
        device: device.key(),
        authority: authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteDevice<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = device_authority)]
    pub device: Box<Account<'info, ChannelDevice>>,

    /// CHECK:
    #[account(mut)]
    pub device_authority: AccountInfo<'info>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
