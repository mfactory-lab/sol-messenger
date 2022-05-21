use crate::instructions::*;
use anchor_lang::prelude::*;

mod error;
mod instructions;
mod state;
mod utils;

declare_id!("6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm");

#[program]
pub mod messenger {
    use super::*;

    pub fn init_channel(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
        init_channel::handler(ctx, data)
    }

    pub fn add_to_channel(ctx: Context<AddToChannel>, data: AddToChannelData) -> Result<()> {
        add_to_channel::handler(ctx, data)
    }

    pub fn post_message(ctx: Context<PostMessage>, message: String) -> Result<()> {
        post_message::handler(ctx, message)
    }
}
