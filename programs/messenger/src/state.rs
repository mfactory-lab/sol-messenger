use std::collections::VecDeque;

use anchor_lang::prelude::*;

use crate::{constants::*, MessengerError};

#[account]
pub struct Channel {
    /// Workspace used to group channels
    pub workspace: String,
    /// Name of the channel
    pub name: String,
    /// Channel creator
    pub creator: Pubkey,
    /// Creation date
    pub created_at: i64,
    /// Last message date
    pub last_message_at: i64,
    /// Channel flags
    pub flags: u8,
    /// Number of members
    pub member_count: u16,
    /// Message counter
    pub message_count: u64,
    /// The maximum number of messages that are stored in [messages]
    pub max_messages: u16,
    /// List of latest messages
    pub messages: Vec<Message>,
}

impl Channel {
    /// Calculate channel space
    pub fn space(max_messages: u16) -> usize {
        8 // discriminator
        + (4 + MAX_WORKSPACE_LENGTH) // workspace
        + (4 + MAX_CHANNEL_NAME_LENGTH) // name
        + 32 // creator key
        + 8 + 8 // creation date + last message date
        + 1 // flags
        + 2 + 8 // member_count + message_count
        + 2 + (4 + (Message::SIZE * max_messages as usize)) // max_messages + messages
    }

    /// Post a message to the channel
    pub fn add_message(&mut self, content: String, sender: &Pubkey) -> Result<Message> {
        if content.len() > MAX_MESSAGE_LENGTH {
            msg!(
                "Error: Message too long (size: {}, max: {})",
                content.len(),
                MAX_MESSAGE_LENGTH
            );
            return Err(MessengerError::MessageTooLong.into());
        }

        self.last_message_at = Clock::get()?.unix_timestamp;
        self.message_count = self.message_count.saturating_add(1);

        let bytes = content.as_bytes();

        // first byte is represent message flags
        if let [flags, bytes @ ..] = bytes {
            let message = Message {
                id: self.message_count,
                sender: *sender,
                created_at: self.last_message_at,
                flags: *flags,
                content: std::str::from_utf8(bytes).unwrap().to_string(),
            };

            let mut deque = VecDeque::from(self.messages.to_owned());
            deque.push_back(message.to_owned());
            if deque.len() > self.max_messages as usize {
                deque.pop_front();
            }

            self.messages = deque.into();

            Ok(message)
        } else {
            Err(MessengerError::InvalidMessage.into())
        }
    }

    pub fn authorize(&self, key: &Pubkey) -> bool {
        self.creator == *key || ADMIN_AUTHORITY.contains(&key.to_string().as_str())
    }

    pub fn is_public(&self) -> bool {
        self.flags & ChannelFlags::IsPublic > 0
    }

    pub fn is_permissionless(&self) -> bool {
        self.flags & ChannelFlags::Permissionless > 0
    }
}

#[allow(non_snake_case, non_upper_case_globals)]
pub mod ChannelFlags {
    /// [Channel] messages is not encrypted and [ChannelMembership] is not required
    pub const IsPublic: u8 = 0b001;
    /// Do not check channel permission when adding, deleting, authorizing a member
    pub const Permissionless: u8 = 0b010;
}

#[account]
pub struct ChannelDevice {
    /// Associated [Channel] address
    pub channel: Pubkey,
    /// Authority of the [ChannelKey]
    pub authority: Pubkey,
    /// The device key used to encrypt the `cek`
    pub key: Pubkey,
    /// The content encryption key (CEK)
    pub cek: CEKData,
    /// Bump seed for deriving PDA seeds
    pub bump: u8,
}

impl ChannelDevice {
    pub fn space() -> usize {
        8 + 32 + 32 + 32 + CEKData::SIZE + 1
    }
}

#[account]
pub struct ChannelMembership {
    /// Associated [Channel] address
    pub channel: Pubkey,
    /// Authority of membership
    pub authority: Pubkey,
    /// Status of membership
    pub status: ChannelMembershipStatus,
    /// Status target key
    pub status_target: Option<Pubkey>,
    /// Name of the channel member
    pub name: String,
    /// The last read message id
    pub last_read_message_id: u64,
    /// Creation date
    pub created_at: i64,
    /// Membership flags
    pub flags: u8,
    /// Bump seed for deriving PDA seeds
    pub bump: u8,
}

impl ChannelMembership {
    pub fn space() -> usize {
        8 // discriminator
        + 32 + 32 // channel + authority
        // + 32 + CEKData::SIZE // key + cek
        + 1 + (1 + 32) // status + status_target
        + (4 + MAX_MEMBER_NAME_LENGTH) // name
        + 8 + 8 // last_read_message_id + created_at
        + 1 + 1 // flags + bump
    }

    pub fn is_pending(&self) -> bool {
        self.status == ChannelMembershipStatus::Pending
    }

    pub fn is_authorized(&self) -> bool {
        self.status == ChannelMembershipStatus::Authorized
    }

    pub fn is_owner(&self) -> bool {
        self.flags == ChannelMembershipAccess::Owner
    }

    pub fn is_admin(&self) -> bool {
        self.flags & ChannelMembershipAccess::Admin == ChannelMembershipAccess::Admin
    }

    pub fn can_add_member(&self, channel: &Channel) -> bool {
        channel.is_permissionless() || self.flags & ChannelMembershipAccess::AddMember > 0
    }

    pub fn can_delete_member(&self, channel: &Channel) -> bool {
        channel.is_permissionless() || self.flags & ChannelMembershipAccess::DeleteMember > 0
    }

    pub fn can_authorize_member(&self, channel: &Channel) -> bool {
        channel.is_permissionless() || self.flags & ChannelMembershipAccess::AuthorizeMember > 0
    }
}

#[allow(non_snake_case, non_upper_case_globals)]
pub mod ChannelMembershipAccess {
    pub const AddMember: u8 = 0b001;
    pub const DeleteMember: u8 = 0b010;
    pub const AuthorizeMember: u8 = 0b100;
    pub const Admin: u8 = AddMember | DeleteMember | AuthorizeMember;
    pub const Owner: u8 = 0xff;
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ChannelMembershipStatus {
    Authorized,
    Pending,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct CEKData {
    /// The header information for the CEK
    pub header: String,
    /// The CEK itself
    pub encrypted_key: String,
}

impl CEKData {
    pub const HEADER_SIZE: usize = 72; // iv + tag + key (24 + 16 + 32)
    pub const SIZE: usize = (4 + Self::HEADER_SIZE) + (4 + MAX_CEK_LENGTH);

    pub fn empty() -> Self {
        Self {
            header: "".to_string(),
            encrypted_key: "".to_string(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Message {
    /// Uniq message id
    pub id: u64,
    /// The message sender id
    pub sender: Pubkey,
    /// The unix timestamp at which the message was received
    pub created_at: i64,
    /// Message flags
    pub flags: u8,
    /// The (typically encrypted) message content
    pub content: String,
}

impl Message {
    pub const SIZE: usize = 8 + 32 + 8 + 1 + (4 + MAX_MESSAGE_LENGTH);

    pub fn is_encrypted(&self) -> bool {
        self.flags & MessageFlags::IsEncrypted > 0
    }
}

#[allow(non_snake_case, non_upper_case_globals)]
pub mod MessageFlags {
    pub const IsEncrypted: u8 = 0b001;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        msg!("Channel {:?}", Channel::space(15));
        msg!("Channel {:?}", ChannelDevice::space());
        msg!("ChannelMembership {:?}", ChannelMembership::space());
        // msg!("{:?}", ChannelMembershipAccess::AddMember);
        // msg!("{:?}", ChannelMembershipAccess::AuthorizeMember);
        // msg!("{:?}", ChannelMembershipAccess::Admin);
        // unimplemented!();
    }
}
