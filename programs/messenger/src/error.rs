use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long")]
    NameTooLong,

    #[msg("Message too long")]
    MessageTooLong,

    #[msg("Already in use")]
    AlreadyInUse,

    #[msg("Uninitialized account")]
    UninitializedAccount,
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
