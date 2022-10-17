use anchor_lang::prelude::*;

/// The seed string used to derive a program address for a Solarium channel (for direct channels)
pub const CHANNEL_ADDRESS_SEED: &[u8; 7] = br"channel";

/// To ensure predictable account addresses, sort the keys.
pub fn direct_channel_address_order<'a>(a: &'a Pubkey, b: &'a Pubkey) -> [&'a Pubkey; 2] {
    match *a < *b {
        true => [a, b],
        false => [b, a],
    }
}

/// Get the program-derived channel account address for a direct channel
pub fn get_channel_address_with_seed(program_id: &Pubkey, key0: &Pubkey, key1: &Pubkey) -> (Pubkey, u8) {
    // To ensure predictable account addresses, sort the DIDs.
    let [a, b] = direct_channel_address_order(key0, key1);
    Pubkey::find_program_address(&[&a.to_bytes(), &b.to_bytes(), CHANNEL_ADDRESS_SEED], program_id)
}

/// Pads the string to the desired size with `0u8`s.
/// NOTE: it is assumed that the string's size is never larger than the given size.
pub fn puffed_out_string(s: &str, size: usize) -> String {
    let mut array_of_zeroes = vec![];
    let puff_amount = size - s.len();
    while array_of_zeroes.len() < puff_amount {
        array_of_zeroes.push(0u8);
    }
    s.to_owned() + std::str::from_utf8(&array_of_zeroes).unwrap()
}
