use anchor_lang::prelude::*;

use crate::{constants::MAX_MEMBER_NAME_LENGTH, events::JoinChannelEvent, state::*, MessengerError};

pub fn handler(ctx: Context<JoinChannel>, data: JoinChannelData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    channel.member_count = channel.member_count.saturating_add(1);

    let timestamp = Clock::get()?.unix_timestamp;

    let membership = &mut ctx.accounts.membership;
    membership.channel = channel.key();
    membership.authority = ctx.accounts.authority.key();
    membership.name = data.name;
    membership.created_at = timestamp;
    membership.flags = 0;
    membership.status = ChannelMembershipStatus::Pending;
    membership.status_target = data.authority;
    membership.bump = ctx.bumps.membership;

    let device = &mut ctx.accounts.device;
    device.channel = channel.key();
    device.authority = ctx.accounts.authority.key();
    device.key = ctx.accounts.key.key();
    device.cek = CEKData::empty();
    device.bump = ctx.bumps.device;

    emit!(JoinChannelEvent {
        channel: channel.key(),
        membership: membership.key(),
        device: device.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct JoinChannelData {
    pub name: String,
    // TODO: rename -> target
    pub authority: Option<Pubkey>,
}

impl JoinChannelData {
    pub fn validate(&self) -> Result<()> {
        if self.name.len() > MAX_MEMBER_NAME_LENGTH {
            return Err(MessengerError::NameTooLong.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct JoinChannel<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(
        init,
        seeds = [channel.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = authority,
        space = ChannelMembership::space()
    )]
    pub membership: Box<Account<'info, ChannelMembership>>,

    #[account(
        init,
        seeds = [membership.key().as_ref(), key.key().as_ref()],
        bump,
        payer = authority,
        space = ChannelDevice::space()
    )]
    pub device: Box<Account<'info, ChannelDevice>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub key: Signer<'info>,

    pub system_program: Program<'info, System>,
}
