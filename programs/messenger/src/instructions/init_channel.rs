use anchor_lang::prelude::*;

use crate::{constants::MAX_CHANNEL_NAME_LENGTH, events::NewChannelEvent, state::*, MessengerError};

pub fn handler(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
    data.validate()?;

    let clock = Clock::get()?;

    let authority = &ctx.accounts.authority;

    let channel = &mut ctx.accounts.channel;
    channel.name = data.name.to_owned();
    channel.creator = authority.key();
    channel.member_count = 1;
    channel.message_count = 0;
    channel.flags = 0;
    channel.max_messages = data.max_messages;
    channel.messages = Vec::with_capacity(data.max_messages as usize);
    channel.created_at = clock.unix_timestamp;

    if data.public {
        channel.flags |= ChannelFlags::IsPublic;
    }

    if data.permissionless {
        channel.flags |= ChannelFlags::Permissionless;
    }

    let key = &ctx.accounts.key;

    let membership = &mut ctx.accounts.membership;
    membership.channel = channel.key();
    membership.authority = authority.key();
    membership.key = key.key();
    membership.cek = data.cek;
    membership.name = data.member_name;
    membership.status = ChannelMembershipStatus::Authorized { by: None };
    membership.created_at = clock.unix_timestamp;
    membership.flags = ChannelMembershipAccess::Owner;
    membership.bump = ctx.bumps["membership"];

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
    #[account(
        init,
        payer = authority,
        space = Channel::space(data.max_messages),
    )]
    channel: Box<Account<'info, Channel>>,

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
