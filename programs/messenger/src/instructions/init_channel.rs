use anchor_lang::prelude::*;

use crate::{
    constants::{MAX_CHANNEL_NAME_LENGTH, MAX_WORKSPACE_LENGTH},
    events::NewChannelEvent,
    state::*,
    MessengerError,
};

pub fn handler(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
    data.validate()?;

    let timestamp = Clock::get()?.unix_timestamp;

    let authority = &ctx.accounts.authority;

    let channel = &mut ctx.accounts.channel;
    channel.workspace = data.workspace.to_owned();
    channel.name = data.name.to_owned();
    channel.creator = authority.key();
    channel.member_count = 1;
    channel.message_count = 0;
    channel.flags = 0;
    channel.max_messages = data.max_messages;
    channel.messages = Vec::with_capacity(data.max_messages as usize);
    channel.created_at = timestamp;

    if data.public {
        channel.flags |= ChannelFlags::IsPublic;
    }

    if data.permissionless {
        channel.flags |= ChannelFlags::Permissionless;
    }

    let membership = &mut ctx.accounts.membership;
    membership.channel = channel.key();
    membership.authority = authority.key();
    // membership.key = ctx.accounts.key.key();
    // membership.cek = data.cek;
    membership.name = data.member_name;
    membership.status = ChannelMembershipStatus::Authorized;
    membership.created_at = timestamp;
    membership.flags = ChannelMembershipAccess::Owner;
    membership.bump = ctx.bumps.membership;

    let device = &mut ctx.accounts.device;
    device.channel = channel.key();
    device.authority = authority.key();
    device.key = ctx.accounts.key.key();
    device.cek = data.cek;
    device.bump = ctx.bumps.device;

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
    pub workspace: String,
    pub name: String,
    pub max_messages: u16,
    pub member_name: String,
    pub cek: CEKData,
    // flags
    pub public: bool,
    pub permissionless: bool,
}

impl InitChannelData {
    pub fn validate(&self) -> Result<()> {
        if self.workspace.len() > MAX_WORKSPACE_LENGTH {
            return Err(MessengerError::WorkspaceTooLong.into());
        }
        if self.name.len() > MAX_CHANNEL_NAME_LENGTH {
            return Err(MessengerError::NameTooLong.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    data: InitChannelData,
)]
pub struct InitChannel<'info> {
    #[account(zero)]
    channel: Account<'info, Channel>,

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
