use anchor_lang::prelude::*;

#[error_code]
pub enum MessengerError {
    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Invalid channel")]
    InvalidChannel,

    #[msg("Invalid membership")]
    InvalidMembership,

    #[msg("Invalid device")]
    InvalidDevice,

    #[msg("Invalid message")]
    InvalidMessage,

    #[msg("Name too long")]
    NameTooLong,

    #[msg("Workspace too long")]
    WorkspaceTooLong,

    #[msg("Message too long")]
    MessageTooLong,
}

// #[macro_export]
// macro_rules! print_error {
//     ($err:expr) => {{
//         || {
//             let error_code: ErrorCode = $err;
//             msg!("{:?} thrown at {}:{}", error_code, file!(), line!());
//             $err
//         }
//     }};
// }
