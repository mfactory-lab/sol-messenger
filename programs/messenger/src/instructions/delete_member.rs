use anchor_lang::prelude::*;

use crate::{events::DeleteMemberEvent, state::*};

pub fn handler(ctx: Context<DeleteMember>) -> Result<()> {
    let channel = &mut ctx.accounts.channel;
    let aca = &ctx.accounts.aca;

    channel.member_count = channel.member_count.saturating_sub(1);

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(DeleteMemberEvent {
        channel: channel.key(),
        aca: aca.key(),
        timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut, constraint = channel.creator.key() == authority.key())]
    pub channel: Box<Account<'info, Channel>>,

    #[account(mut, has_one = channel, close = authority)]
    pub aca: Account<'info, AssociatedChannelAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one = channel, has_one = authority)]
    pub authority_aca: Account<'info, AssociatedChannelAccount>,

    pub system_program: Program<'info, System>,
}
