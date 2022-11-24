use anchor_lang::prelude::*;

use crate::state::Message;

#[event]
pub struct NewChannelEvent {
    #[index]
    pub channel: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub timestamp: i64,
}

#[event]
pub struct DeleteChannelEvent {
    #[index]
    pub channel: Pubkey,
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct NewMessageEvent {
    #[index]
    pub channel: Pubkey,
    pub message: Message,
}

#[event]
pub struct JoinChannelEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub membership: Pubkey,
    pub device: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct LeaveChannelEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AddMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub membership: Pubkey,
    pub by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AuthorizeMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub membership: Pubkey,
    pub by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub membership: Pubkey,
    pub by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AddDeviceEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub device: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteDeviceEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub device: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}
