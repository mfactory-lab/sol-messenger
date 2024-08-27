use anchor_lang::prelude::*;

use crate::{
    constants::MAX_CHANNEL_NAME_LENGTH,
    events::AddMemberEvent,
    state::{CEKData, Channel, ChannelDevice, ChannelMembership, ChannelMembershipStatus},
    utils::assert_valid_membership,
    MessengerError,
};

pub fn handler(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;
    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority_key = ctx.accounts.authority.key;
    let is_super_admin = channel.authorize(authority_key);
    let mut flags = data.flags;

    if !is_super_admin {
        let auth_membership = assert_valid_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        if !auth_membership.is_authorized() || !auth_membership.can_add_member(channel) {
            return Err(MessengerError::Unauthorized.into());
        }
        // only owner authority can set membership flags
        if !auth_membership.is_owner() {
            flags = 0;
        }
    }

    let timestamp = Clock::get()?.unix_timestamp;

    let membership = &mut ctx.accounts.invitee_membership;

    membership.channel = channel.key();
    membership.authority = ctx.accounts.invitee.key();
    // membership.key = data.key.unwrap_or_else(|| ctx.accounts.invitee.key());
    membership.name = data.name;
    // membership.cek = data.cek;
    membership.flags = flags;
    membership.created_at = timestamp;
    membership.status = ChannelMembershipStatus::Authorized;
    membership.status_target = Some(ctx.accounts.authority.key());
    membership.bump = ctx.bumps.invitee_membership;

    let device = &mut ctx.accounts.invitee_device;
    device.channel = channel.key();
    device.authority = ctx.accounts.invitee.key();
    device.key = data.key;
    device.cek = data.cek;
    device.bump = ctx.bumps.invitee_device;

    channel.member_count = channel.member_count.saturating_add(1);

    emit!(AddMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        by: *authority_key,
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddMemberData {
    /// Member name
    pub name: String,
    /// Membership flags, only `admin` and `owner` can set membership flags
    pub flags: u8,
    /// Content Encryption Key
    pub cek: CEKData,
    /// Device key
    pub key: Pubkey,
}

impl AddMemberData {
    pub fn validate(&self) -> Result<()> {
        if self.name.len() > MAX_CHANNEL_NAME_LENGTH {
            return Err(MessengerError::NameTooLong.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(data: AddMemberData)]
pub struct AddMember<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    /// CHECK:
    pub invitee: AccountInfo<'info>,

    #[account(
        init,
        seeds = [channel.key().as_ref(), invitee.key().as_ref()],
        bump,
        payer = authority,
        space = ChannelMembership::space()
    )]
    pub invitee_membership: Box<Account<'info, ChannelMembership>>,

    #[account(
        init,
        seeds = [invitee_membership.key().as_ref(), data.key.as_ref()],
        bump,
        payer = authority,
        space = ChannelDevice::space()
    )]
    pub invitee_device: Box<Account<'info, ChannelDevice>>,

    /// CHECK:
    #[account(mut)]
    pub authority_membership: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
