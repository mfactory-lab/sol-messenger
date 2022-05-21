use crate::state::*;
use crate::utils::check_channel;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AddToChannel<'info> {
    #[account(mut)]
    pub channel: Box<Account<'info, Channel>>,
    #[account(mut)]
    pub inviter: Signer<'info>,
    #[account(
        mut,
        has_one = channel,
        seeds = [channel.key().as_ref(), inviter.key().as_ref()],
        bump,
        constraint = inviter.key() == inviter_aca.owner
    )]
    pub inviter_aca: Account<'info, AssociatedChannelAccount>,
    /// CHECK:
    pub invitee: AccountInfo<'info>,
    #[account(
        init,
        seeds = [channel.key().as_ref(), invitee.key().as_ref()],
        bump,
        payer = inviter,
        space = AssociatedChannelAccount::space()
    )]
    pub invitee_aca: Account<'info, AssociatedChannelAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddToChannelData {
    pub cek: CEKData,
}

pub fn handler(ctx: Context<AddToChannel>, data: AddToChannelData) -> Result<()> {
    let channel = &mut ctx.accounts.channel;

    check_channel(channel)?;

    let clock = Clock::get().unwrap();

    let aca = &mut ctx.accounts.invitee_aca;

    aca.channel = channel.key();
    aca.owner = *ctx.accounts.invitee.key;
    aca.created_at = clock.unix_timestamp;
    aca.cek = data.cek;

    channel.member_count = channel.member_count + 1;

    Ok(())
}
