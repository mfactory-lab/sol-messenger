use anchor_lang::{prelude::*, solana_program::system_program};

use crate::{
    errors::MessengerError,
    state::{ChannelDevice, ChannelMembership},
};

pub fn close<'info>(info: AccountInfo<'info>, sol_destination: AccountInfo<'info>) -> Result<()> {
    // Transfer lamports from the account to the sol_destination.
    let dest_starting_lamports = sol_destination.lamports();
    **sol_destination.lamports.borrow_mut() = dest_starting_lamports.checked_add(info.lamports()).unwrap();
    **info.lamports.borrow_mut() = 0;

    info.assign(&system_program::ID);
    info.realloc(0, false).map_err(Into::into)
}

pub fn assert_valid_membership<'info>(
    account: &AccountInfo<'info>,
    channel: &Pubkey,
    authority: &Pubkey,
) -> Result<ChannelMembership> {
    let mut data: &[u8] = &account.try_borrow_data()?;
    let membership = ChannelMembership::try_deserialize(&mut data).map_err(|_e| MessengerError::InvalidMembership)?;

    if membership.channel != channel.key() {
        msg!("Error: Invalid membership channel");
        return Err(MessengerError::InvalidMembership.into());
    }
    if membership.authority != authority.key() {
        msg!("Error: Invalid membership authority");
        return Err(MessengerError::InvalidMembership.into());
    }
    Ok(membership)
}

pub fn assert_valid_device<'info>(
    account: &'info AccountInfo<'info>,
    channel: &Pubkey,
    authority: &Pubkey,
) -> Result<ChannelDevice> {
    let mut data: &[u8] = &account.try_borrow_data()?;
    let device = ChannelDevice::try_deserialize(&mut data).map_err(|_e| MessengerError::InvalidDevice)?;
    if device.channel != channel.key() {
        msg!("Error: Invalid device channel");
        return Err(MessengerError::InvalidDevice.into());
    }
    if device.authority != authority.key() {
        msg!("Error: Invalid device authority");
        return Err(MessengerError::InvalidDevice.into());
    }
    Ok(device)
}

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
// pub fn get_channel_address_with_seed(program_id: &Pubkey, key0: &Pubkey, key1: &Pubkey) -> (Pubkey, u8) {
//     // To ensure predictable account addresses, sort the DIDs.
//     let [a, b] = direct_channel_address_order(key0, key1);
//     Pubkey::find_program_address(&[&a.to_bytes(), &b.to_bytes(), CHANNEL_ADDRESS_SEED], program_id)
// }
//
// /// Pads the string to the desired size with `0u8`s.
// /// NOTE: it is assumed that the string's size is never larger than the given size.
// pub fn puffed_out_string(s: &str, size: usize) -> String {
//     let mut array_of_zeroes = vec![];
//     let puff_amount = size - s.len();
//     while array_of_zeroes.len() < puff_amount {
//         array_of_zeroes.push(0u8);
//     }
//     s.to_owned() + std::str::from_utf8(&array_of_zeroes).unwrap()
// }
