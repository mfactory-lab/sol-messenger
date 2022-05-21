use crate::error::ErrorCode;
use crate::state::*;
use crate::utils::check_channel;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PostMessage<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    #[account(
        mut,
        has_one = channel,
        seeds = [channel.key().as_ref(), sender.key().as_ref()],
        bump,
        constraint = associated_channel_account.owner == sender.key()
    )]
    pub associated_channel_account: Account<'info, AssociatedChannelAccount>,
    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PostMessage>, message: String) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    check_channel(channel)?;

    if message.len() > MAX_MESSAGE_LENGTH {
        msg!(
            "Message to long (size: {}, max: {})",
            message.len(),
            MAX_MESSAGE_LENGTH
        );
        return Err(ErrorCode::MessageTooLong.into());
    }

    // TODO: check associated_channel_account ?

    let sender = ctx.accounts.sender.key;

    channel.post(Message::new(*sender, message));

    Ok(())
}
