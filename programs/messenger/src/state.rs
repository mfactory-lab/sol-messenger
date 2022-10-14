use std::collections::VecDeque;

use anchor_lang::{prelude::*, solana_program::program_pack::IsInitialized};

use crate::ErrorCode;

pub const MAX_CHANNEL_NAME_LENGTH: usize = 32;
pub const MAX_MEMBER_NAME_LENGTH: usize = 32;
pub const MAX_MESSAGE_LENGTH: usize = 400; // ~ 255 raw bytes
pub const MAX_CEK_LENGTH: usize = 100; // ~ 32 raw bytes

#[account]
pub struct Channel {
    /// Name of the channel
    pub name: String,
    /// Channel creator
    pub creator: Pubkey,
    /// Creation date
    pub created_at: i64,
    /// Number of members
    pub member_count: u16,
    /// Message counter
    pub message_count: u32,
    /// The maximum number of messages that are stored in [messages]
    pub max_messages: u16,
    /// List of messages
    pub messages: VecDeque<Message>,
}

impl Channel {
    /// Calculate channel space
    pub fn space(max_messages: u16) -> usize {
        8 // discriminator
        + (4 + MAX_CHANNEL_NAME_LENGTH) // name
        + 32 // creator key
        + 8 // creation date
        + 2 + 4 // member_count + message_count
        + 2 + (4 + (Message::SIZE * max_messages as usize)) // max_messages + messages
    }

    /// Post a message to the channel
    pub fn add_message(&mut self, content: String, sender: &Pubkey) -> Result<Message> {
        if content.len() > MAX_MESSAGE_LENGTH {
            msg!("Message to long (size: {}, max: {})", content.len(), MAX_MESSAGE_LENGTH);
            return Err(ErrorCode::MessageTooLong.into());
        }

        self.message_count = self.message_count.saturating_add(1);

        let message = Message {
            id: self.message_count,
            sender: *sender,
            created_at: Clock::get()?.unix_timestamp,
            content,
        };

        self.messages.push_back(message.to_owned());
        if self.messages.len() > self.max_messages as usize {
            self.messages.pop_front();
        }

        Ok(message)
    }

    pub fn validate(&self) -> Result<()> {
        if !self.is_initialized() {
            msg!("Channel account is not initialized");
            return Err(ErrorCode::UninitializedAccount.into());
        }
        Ok(())
    }
}

impl IsInitialized for Channel {
    /// Checks if a channel has been initialized
    fn is_initialized(&self) -> bool {
        !self.name.is_empty()
    }
}

#[account]
pub struct AssociatedChannelAccount {
    /// Associated [Channel] address
    pub channel: Pubkey,
    /// Authority account
    pub authority: Pubkey,
    /// The public key used to encrypt the `CEK`
    pub cek_key: Pubkey,
    /// The content encryption key (CEK) of the channel
    pub cek: CEKData,
    /// Status of membership
    pub status: ACAStatus,
    /// Name of the channel member
    pub name: String,
    /// Inviter address
    pub invited_by: Option<Pubkey>,
    /// Creation date
    pub created_at: i64,
    /// Bump seed for deriving PDA seeds
    pub bump: u8,
}

impl AssociatedChannelAccount {
    pub fn space() -> usize {
        8 // discriminator
        + 32 + 32 + 32 // channel + authority + cek_key
        + CEKData::SIZE + ACAStatus::SIZE
        + (4 + MAX_MEMBER_NAME_LENGTH) // name
        + (1 + 32) + 8 + 1 // invited_by + created_at + bump
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ACAStatus {
    Authorized { by: Option<Pubkey> },
    Pending { authority: Option<Pubkey> },
}

impl ACAStatus {
    const SIZE: usize = 34;
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
    pub id: u32,
    /// The message sender id
    pub sender: Pubkey,
    /// The unix timestamp at which the message was received
    pub created_at: i64,
    /// The (typically encrypted) message content
    pub content: String,
}

impl Message {
    pub const SIZE: usize = 4 + 32 + 8 + (4 + MAX_MESSAGE_LENGTH);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        unimplemented!();
    }
}
