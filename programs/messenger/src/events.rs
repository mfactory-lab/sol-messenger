use crate::{state::Message, *};

#[event]
pub struct NewChannelEvent {
    #[index]
    pub channel: Pubkey,
    pub creator: Pubkey,
    pub name: String,
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
    pub aca: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AddMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub aca: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AuthorizeMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub aca: Pubkey,
    pub by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DeleteMemberEvent {
    #[index]
    pub channel: Pubkey,
    #[index]
    pub aca: Pubkey,
    pub timestamp: i64,
}
