use anchor_lang::prelude::*;

use crate::{events::AuthorizeMemberEvent, state::*, MessengerError};

pub fn handler(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
    let authority_membership = &ctx.accounts.authority_membership;
    if !authority_membership.can_authorize_member() {
        return Err(MessengerError::Unauthorized.into());
    }

    let channel = &ctx.accounts.channel;
    let membership = &mut ctx.accounts.membership;
    let auth = &ctx.accounts.authority;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    match membership.status {
        ChannelMembershipStatus::Pending { authority } => {
            if let Some(authority) = authority {
                if authority.key() != auth.key() {
                    msg!("Error: Should be authorized by {}", authority.key());
                    return Err(MessengerError::Unauthorized.into());
                }
            }
        }
        _ => {
            msg!("Error: Member already authorized");
            return Err(MessengerError::Unauthorized.into());
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

    #[account(has_one = channel, has_one = authority, constraint = authority_membership.is_authorized() @ MessengerError::Unauthorized)]
    pub authority_membership: Account<'info, ChannelMembership>,

    pub system_program: Program<'info, System>,
}
