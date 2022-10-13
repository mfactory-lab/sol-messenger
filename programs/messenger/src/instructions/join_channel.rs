use anchor_lang::prelude::*;

use crate::{events::JoinChannelEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<JoinChannel>, data: JoinChannelData) -> Result<()> {
    data.validate()?;

    let channel = &mut ctx.accounts.channel;

    channel.validate()?;

    let timestamp = Clock::get()?.unix_timestamp;
    let authority = &ctx.accounts.authority;

    let aca = &mut ctx.accounts.aca;
    aca.channel = channel.key();
    aca.authority = authority.key();
    aca.cek_key = data.cek_key.unwrap_or_else(|| authority.key());
    aca.cek = CEKData::empty();
    aca.status = ACAStatus::Pending {
        authority: data.authority,
    };
    aca.name = data.name;
    aca.invited_by = None;
    aca.created_at = timestamp;
    aca.bump = ctx.bumps["aca"];

    channel.member_count = channel.member_count.saturating_add(1);

    emit!(JoinChannelEvent {
        channel: channel.key(),
        aca: aca.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct JoinChannelData {
    pub name: String,
    pub cek_key: Option<Pubkey>,
    pub authority: Option<Pubkey>,
}

impl JoinChannelData {
    pub fn validate(&self) -> Result<()> {
        if self.name.len() > MAX_MEMBER_NAME_LENGTH {
            return Err(ErrorCode::NameTooLong.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct JoinChannel<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub cek_key: Signer<'info>,

    #[account(
        init,
        seeds = [channel.key().as_ref(), cek_key.key().as_ref()],
        bump,
        payer = authority,
        space = AssociatedChannelAccount::space()
    )]
    pub aca: Account<'info, AssociatedChannelAccount>,

    pub system_program: Program<'info, System>,
}
