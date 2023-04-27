// #![warn(clippy::all, clippy::pedantic)]

mod constants;
mod errors;
mod events;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use errors::*;
use instructions::*;

declare_id!("CgRaMXqqRHNT3Zo2uVZfX72TuxUgcLb8E3A8KrXnbXAC");

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

    pub fn leave_channel<'info>(ctx: Context<'_, '_, '_, 'info, LeaveChannel<'info>>) -> Result<()> {
        leave_channel::handler(ctx)
    }

    pub fn grant_access_member(ctx: Context<GrantAccessMember>, data: GrantAccessMemberData) -> Result<()> {
        grant_access_member::handler(ctx, data)
    }

    pub fn add_member(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
        add_member::handler(ctx, data)
    }

    pub fn authorize_member(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
        authorize_member::handler(ctx, data)
    }

    pub fn delete_member<'info>(ctx: Context<'_, '_, '_, 'info, DeleteMember<'info>>) -> Result<()> {
        delete_member::handler(ctx)
    }

    pub fn add_meta(ctx: Context<AddMeta>, data: AddMetaData) -> Result<()> {
        add_meta::handler(ctx, data)
    }

    pub fn delete_meta(ctx: Context<DeleteMeta>) -> Result<()> {
        delete_meta::handler(ctx)
    }

    pub fn add_device(ctx: Context<AddDevice>, data: AddDeviceData) -> Result<()> {
        add_device::handler(ctx, data)
    }

    pub fn delete_device(ctx: Context<DeleteDevice>) -> Result<()> {
        delete_device::handler(ctx)
    }

    pub fn post_message(ctx: Context<PostMessage>, message: String) -> Result<()> {
        post_message::handler(ctx, message)
    }

    pub fn read_message(ctx: Context<ReadMessage>, message_id: u64) -> Result<()> {
        read_message::handler(ctx, message_id)
    }

    pub fn update_message(ctx: Context<UpdateMessage>, id: u64, message: String) -> Result<()> {
        update_message::handler(ctx, id, message)
    }

    pub fn delete_message(ctx: Context<DeleteMessage>, id: u64) -> Result<()> {
        delete_message::handler(ctx, id)
    }
}
