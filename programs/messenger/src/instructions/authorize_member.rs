use anchor_lang::prelude::*;

use crate::{events::AuthorizeMemberEvent, state::*, utils::assert_valid_membership, MessengerError};

pub fn handler(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
    let channel = &ctx.accounts.channel;

    if channel.to_account_info().data_is_empty() {
        return Err(MessengerError::InvalidChannel.into());
    }

    let authority_key = ctx.accounts.authority.key;
    let is_super_admin = channel.authorize(authority_key);

    if !is_super_admin {
        let auth_membership = assert_valid_membership(
            &ctx.accounts.authority_membership.to_account_info(),
            &channel.key(),
            authority_key,
        )?;
        if !auth_membership.is_authorized() || !auth_membership.can_authorize_member(channel) {
            return Err(MessengerError::Unauthorized.into());
        }
    }

    let membership = &mut ctx.accounts.membership;

    match membership.status {
        ChannelMembershipStatus::Pending => {
            if let Some(target_authority) = membership.status_target {
                if target_authority.key() != *authority_key {
                    msg!("Error: Should be authorized by {}", target_authority.key());
                    return Err(MessengerError::Unauthorized.into());
                }
            }
        }
        _ => {
            msg!("Error: Member already authorized");
            return Err(MessengerError::Unauthorized.into());
        }
    }

    membership.status_target = Some(*authority_key);
    membership.status = ChannelMembershipStatus::Authorized;
    // membership.cek = data.cek;

    let device = &mut ctx.accounts.device;
    device.cek = data.cek;

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(AuthorizeMemberEvent {
        channel: channel.key(),
        membership: membership.key(),
        authority: membership.authority,
        by: *authority_key,
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
    pub membership: Box<Account<'info, ChannelMembership>>,

    #[account(mut, has_one = channel, constraint = device.authority == membership.authority)]
    pub device: Box<Account<'info, ChannelDevice>>,

    pub authority: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub authority_membership: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
