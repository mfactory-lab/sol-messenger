use anchor_lang::prelude::*;

use crate::{constants::MAX_MEMBER_NAME_LENGTH, events::JoinChannelEvent, state::*, MessengerError};

pub fn handler(ctx: Context<JoinChannel>, data: JoinChannelData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let timestamp = Clock::get()?.unix_timestamp;

    let membership = &mut ctx.accounts.membership;
    membership.channel = channel.key();
    membership.authority = ctx.accounts.authority.key();
    membership.key = ctx.accounts.key.key();
    membership.cek = CEKData::empty();
    membership.name = data.name;
    membership.invited_by = None;
    membership.created_at = timestamp;
    membership.status = ChannelMembershipStatus::Pending {
        authority: data.authority,
    };
    membership.bump = ctx.bumps["membership"];

    channel.member_count = channel.member_count.saturating_add(1);

    emit!(JoinChannelEvent {
        channel: channel.key(),
        membership: membership.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct JoinChannelData {
    pub name: String,
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
        seeds = [channel.key().as_ref(), key.key().as_ref()],
        bump,
        payer = authority,
        space = ChannelMembership::space()
    )]
    pub membership: Box<Account<'info, ChannelMembership>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub key: Signer<'info>,

    pub system_program: Program<'info, System>,
}
