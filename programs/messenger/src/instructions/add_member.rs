use anchor_lang::prelude::*;

use crate::{
    constants::MAX_CHANNEL_NAME_LENGTH,
    events::AddMemberEvent,
    state::{CEKData, Channel, ChannelMembership, ChannelMembershipStatus},
    MessengerError,
};

pub fn handler(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority_membership = &ctx.accounts.authority_membership;
    if !authority_membership.can_add_member() {
        return Err(MessengerError::Unauthorized.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    let membership = &mut ctx.accounts.invitee_membership;

    membership.channel = channel.key();
    membership.authority = ctx.accounts.invitee.key();
    membership.key = data.key.unwrap_or_else(|| ctx.accounts.invitee.key());
    membership.name = data.name;
    membership.cek = data.cek;
    membership.invited_by = Some(ctx.accounts.authority.key());
    membership.created_at = timestamp;
    membership.status = ChannelMembershipStatus::Authorized {
        by: Some(ctx.accounts.authority.key()),
    };
    membership.bump = ctx.bumps["invitee_membership"];

    channel.member_count = channel.member_count.saturating_add(1);

    emit!(AddMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddMemberData {
    /// Member name
    pub name: String,
    /// Content Encryption Key
    pub cek: CEKData,
    /// Device key
    pub key: Option<Pubkey>,
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
        seeds = [channel.key().as_ref(), data.key.unwrap_or_else(|| invitee.key()).as_ref()],
        bump,
        payer = authority,
        space = ChannelMembership::space()
    )]
    pub invitee_membership: Account<'info, ChannelMembership>,

    #[account(mut, has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ MessengerError::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
