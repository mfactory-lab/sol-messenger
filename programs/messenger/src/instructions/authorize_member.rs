use anchor_lang::prelude::*;

use crate::{events::AuthorizeMemberEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let aca = &mut ctx.accounts.aca;
    let auth = &ctx.accounts.authority;

    match aca.status {
        ACAStatus::Pending { authority } => {
            if let Some(authority) = authority {
                if authority.key() != auth.key() {
                    return Err(ErrorCode::Unauthorized.into());
                }
            }
        }
        _ => {
            return Err(ErrorCode::Unauthorized.into());
        }
    }

    aca.cek = data.cek;
    aca.status = ACAStatus::Authorized { by: Some(auth.key()) };

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(AuthorizeMemberEvent {
        channel: channel.key(),
        aca: aca.key(),
        by: auth.key(),
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
