use anchor_lang::prelude::*;

use crate::{events::AddMemberEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;

    channel.validate()?;

    let timestamp = Clock::get()?.unix_timestamp;

    let aca = &mut ctx.accounts.invitee_aca;

    aca.channel = channel.key();
    aca.authority = ctx.accounts.invitee.key();
    aca.cek_key = data.cek_key.unwrap_or_else(|| ctx.accounts.invitee.key());
    aca.name = data.name;
    aca.cek = data.cek;
    aca.status = ACAStatus::Authorized {
        by: Some(ctx.accounts.inviter.key()),
    };
    aca.invited_by = Some(ctx.accounts.inviter.key());
    aca.created_at = timestamp;
    aca.bump = ctx.bumps["invitee_aca"];

    channel.member_count = channel.member_count.saturating_add(1);

    emit!(AddMemberEvent {
        channel: channel.key(),
        aca: aca.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddMemberData {
    pub name: String,
    pub cek: CEKData,
    pub cek_key: Option<Pubkey>,
}

impl AddMemberData {
    pub fn validate(&self) -> Result<()> {
        if self.name.len() > MAX_CHANNEL_NAME_LENGTH {
            return Err(ErrorCode::NameTooLong.into());
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
        seeds = [channel.key().as_ref(), data.cek_key.unwrap_or_else(|| invitee.key()).as_ref()],
        bump,
        payer = inviter,
        space = AssociatedChannelAccount::space()
    )]
    pub invitee_aca: Account<'info, AssociatedChannelAccount>,

    #[account(mut)]
    pub inviter: Signer<'info>,

    #[account(
        mut,
        has_one = channel,
        constraint = inviter_aca.authority == inviter.key()
    )]
    pub inviter_aca: Account<'info, AssociatedChannelAccount>,

    pub system_program: Program<'info, System>,
}
