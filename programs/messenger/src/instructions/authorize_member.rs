use anchor_lang::prelude::*;

use crate::{events::AuthorizeMemberEvent, state::*};

pub fn handler(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let aca = &mut ctx.accounts.aca;

    aca.cek = data.cek;
    aca.status = ACAStatus::Authorized {
        by: Some(ctx.accounts.authority.key()),
    };

    let authority = &ctx.accounts.authority;

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(AuthorizeMemberEvent {
        channel: channel.key(),
        aca: aca.key(),
        by: authority.key(),
        timestamp,
    });

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AuthorizeMemberData {
    pub cek: CEKData,
}

#[derive(Accounts)]
pub struct AuthorizeMember<'info> {
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel)]
    pub aca: Account<'info, AssociatedChannelAccount>,

    pub authority: Signer<'info>,

    #[account(has_one = channel, has_one = authority)]
    pub authority_aca: Account<'info, AssociatedChannelAccount>,

    pub system_program: Program<'info, System>,
}
