use anchor_lang::prelude::*;

use crate::{events::NewMessageEvent, state::*};

pub fn handler(ctx: Context<PostMessage>, content: String) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    channel.validate()?;

    let membership = &ctx.accounts.membership;

    let message = channel.add_message(content, &membership.authority)?;

    emit!(NewMessageEvent {
        channel: channel.key(),
        message,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct PostMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    #[account(mut, has_one = channel, has_one = authority)]
    pub membership: Account<'info, ChannelMembership>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
