use anchor_lang::prelude::*;

pub fn is_admin(key: &Pubkey) -> bool {
    [
        // The program key can be used as admin
        crate::id(),
    ]
    .contains(key)
}

pub const MAX_CHANNEL_NAME_LENGTH: usize = 32;
pub const MAX_MEMBER_NAME_LENGTH: usize = 32;
pub const MAX_MESSAGE_LENGTH: usize = 400; // ~ 255 raw bytes
pub const MAX_CEK_LENGTH: usize = 100; // ~ 32 raw bytes
