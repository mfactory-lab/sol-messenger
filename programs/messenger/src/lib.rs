// #![warn(clippy::all, clippy::pedantic)]

mod constants;
mod errors;
mod events;
mod instructions;
mod state;
// mod utils;

use anchor_lang::prelude::*;
use errors::*;
use instructions::*;

declare_id!("6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm");

#[program]
pub mod messenger {
    use super::*;

    pub fn init_channel(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
        init_channel::handler(ctx, data)
    }

    pub fn delete_channel(ctx: Context<DeleteChannel>) -> Result<()> {
        delete_channel::handler(ctx)
    }

    pub fn join_channel(ctx: Context<JoinChannel>, data: JoinChannelData) -> Result<()> {
        join_channel::handler(ctx, data)
    }

    pub fn leave_channel(ctx: Context<LeaveChannel>) -> Result<()> {
        leave_channel::handler(ctx)
    }

    pub fn add_member(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
        add_member::handler(ctx, data)
    }

    pub fn authorize_member(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
        authorize_member::handler(ctx, data)
    }

    pub fn delete_member(ctx: Context<DeleteMember>) -> Result<()> {
        delete_member::handler(ctx)
    }

    pub fn post_message(ctx: Context<PostMessage>, message: String) -> Result<()> {
        post_message::handler(ctx, message)
    }
}
