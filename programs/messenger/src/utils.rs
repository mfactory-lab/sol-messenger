use std::collections::VecDeque;

use anchor_lang::{prelude::*, solana_program::program_pack::IsInitialized};

use crate::{error::ErrorCode, state::Channel};

// /// The seed string used to derive a program address for a Solarium channel (for direct channels)
// pub const CHANNEL_ADDRESS_SEED: &[u8; 7] = br"channel";
//
// /// To ensure predictable account addresses, sort the keys.
// pub fn direct_channel_address_order<'a>(a: &'a Pubkey, b: &'a Pubkey) -> [&'a Pubkey; 2] {
//     match *a < *b {
//         true => [a, b],
//         false => [b, a],
//     }
// }
//
// /// Get the program-derived channel account address for a direct channel
// pub fn get_channel_address_with_seed(
//     program_id: &Pubkey,
//     key0: &Pubkey,
//     key1: &Pubkey,
// ) -> (Pubkey, u8) {
//     // To ensure predictable account addresses, sort the DIDs.
//     let [a, b] = direct_channel_address_order(key0, key1);
//     Pubkey::find_program_address(
//         &[&a.to_bytes(), &b.to_bytes(), CHANNEL_ADDRESS_SEED],
//         program_id,
//     )
// }

pub fn push_into_deque<T>(vec: Vec<T>, entry: T, size: usize) -> Vec<T> {
    let mut deque: VecDeque<T> = VecDeque::from(vec);
    deque.push_back(entry);
    if deque.len() > size {
        deque.pop_front();
    }
    deque.into()
}

pub fn check_channel(channel: &Channel) -> Result<()> {
    if !channel.is_initialized() {
        msg!("Channel account not initialized");
        return Err(ErrorCode::UninitializedAccount.into());
    }
    Ok(())
}
