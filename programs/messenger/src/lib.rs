use anchor_lang::prelude::*;
use instructions::*;

mod constants;
mod events;
mod instructions;
mod state;
// mod utils;

declare_id!("6RSutwAoRcQPAMwyxZdNeG76fdAxzhgxkCJXpqKCBPdm");

#[program]
pub mod messenger {
    use super::*;

    pub fn init_channel(ctx: Context<InitChannel>, data: InitChannelData) -> Result<()> {
        init_channel::handler(ctx, data)
    }

    pub fn delete_channel(ctx: Context<DeleteChannel>) -> Result<()> {
        delete_channel::handler(ctx)
    }

    pub fn join_channel(ctx: Context<JoinChannel>, data: JoinChannelData) -> Result<()> {
        join_channel::handler(ctx, data)
    }

    pub fn leave_channel(ctx: Context<LeaveChannel>) -> Result<()> {
        leave_channel::handler(ctx)
    }

    pub fn add_member(ctx: Context<AddMember>, data: AddMemberData) -> Result<()> {
        add_member::handler(ctx, data)
    }

    pub fn authorize_member(ctx: Context<AuthorizeMember>, data: AuthorizeMemberData) -> Result<()> {
        authorize_member::handler(ctx, data)
    }

    pub fn delete_member(ctx: Context<DeleteMember>) -> Result<()> {
        delete_member::handler(ctx)
    }

    pub fn post_message(ctx: Context<PostMessage>, message: String) -> Result<()> {
        post_message::handler(ctx, message)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,

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
