use crate::utils::push_into_deque;
use anchor_lang::{prelude::*, solana_program::program_pack::IsInitialized};

pub const MAX_CHANNEL_NAME_LENGTH: usize = 32;
pub const MAX_MESSAGE_LENGTH: usize = 400; // ~ 255 bytes (no encryption)
pub const MAX_CEK_LENGTH: usize = 100; // ~ 32 bytes

#[account]
pub struct Channel {
    /// The channel name
    pub name: String,
    /// The channel authority
    pub authority: Pubkey,
    /// Creation date
    pub created_at: i64,
    /// Number of channel members
    pub member_count: u16,
    /// Max messages in this channel
    pub max_messages: u16,
    /// All of the messages in the channel
    pub messages: Vec<Message>,
}

impl Channel {
    /// Calculate channel space
    pub fn space(max_messages: u16) -> usize {
        return 8 // discriminator
            + (4 + MAX_CHANNEL_NAME_LENGTH)
            + 32
            + 8
            + 2
            + 2
            + 4
            + (Message::SIZE * max_messages as usize);
    }

    /// Post a message to the channel
    pub fn post(&mut self, mut message: Message) {
        let clock = Clock::get().unwrap();
        message.created_at = clock.unix_timestamp;
        self.messages = push_into_deque(self.messages.clone(), message, self.max_messages as usize);
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
    /// The channel address
    pub channel: Pubkey,
    /// The owner that can decrypt the CEK in this account
    pub owner: Pubkey,
    // /// Inviter address
    // pub invited_by: Optional(Pubkey),
    /// The CEK for the channel
    pub cek: CEKData,
    /// Creation date
    pub created_at: i64,
}

impl AssociatedChannelAccount {
    pub fn space() -> usize {
        return 8 + 32 + 32 + CEKData::SIZE + 8;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct CEKData {
    /// The header information for the CEK
    pub header: String, // iv + tag + key (24 + 16 + 32)
    /// The CEK itself
    pub encrypted_key: String,
}

impl CEKData {
    pub const SIZE: usize = 4 + 72 + 4 + MAX_CEK_LENGTH;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct Message {
    /// The message sender id
    pub sender: Pubkey,
    /// The unix timestamp at which the message was received
    pub created_at: i64,
    /// The (typically encrypted) message content
    pub content: String,
}

impl Message {
    pub const SIZE: usize = 32 + 8 + (4 + MAX_MESSAGE_LENGTH);

    pub fn new(sender: Pubkey, content: String) -> Self {
        Self {
            created_at: 0,
            sender,
            content,
        }
    }
}
