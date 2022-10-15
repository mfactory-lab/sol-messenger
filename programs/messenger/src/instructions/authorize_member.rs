use anchor_lang::prelude::*;

use crate::{events::AuthorizeMemberEvent, state::*, ErrorCode};

pub fn handler(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
    let channel = &ctx.accounts.channel;
    let membership = &mut ctx.accounts.membership;
    let auth = &ctx.accounts.authority;

    match membership.status {
        ChannelMembershipStatus::Pending { authority } => {
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

    // TODO: validate membership.key == data.cek.pubkey

    membership.cek = data.cek;
    membership.status = ChannelMembershipStatus::Authorized { by: Some(auth.key()) };

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(AuthorizeMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
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
    pub membership: Account<'info, ChannelMembership>,

    pub authority: Signer<'info>,

    #[account(has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ ErrorCode::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    pub system_program: Program<'info, System>,
}
