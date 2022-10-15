/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number }
type MaybeErrorWithCode = ErrorWithCode | null | undefined

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map()
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map()

/**
 * Unauthorized: 'Unauthorized'
 *
 * @category Errors
 * @category generated
 */
export class UnauthorizedError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'Unauthorized'
  constructor() {
    super('Unauthorized')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnauthorizedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new UnauthorizedError())
createErrorFromNameLookup.set('Unauthorized', () => new UnauthorizedError())

/**
 * NameTooLong: 'Name too long'
 *
 * @category Errors
 * @category generated
 */
export class NameTooLongError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'NameTooLong'
  constructor() {
    super('Name too long')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, NameTooLongError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new NameTooLongError())
createErrorFromNameLookup.set('NameTooLong', () => new NameTooLongError())

/**
 * MessageTooLong: 'Message too long'
 *
 * @category Errors
 * @category generated
 */
export class MessageTooLongError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'MessageTooLong'
  constructor() {
    super('Message too long')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, MessageTooLongError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new MessageTooLongError())
createErrorFromNameLookup.set('MessageTooLong', () => new MessageTooLongError())

/**
 * AlreadyInUse: 'Already in use'
 *
 * @category Errors
 * @category generated
 */
export class AlreadyInUseError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'AlreadyInUse'
  constructor() {
    super('Already in use')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AlreadyInUseError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new AlreadyInUseError())
createErrorFromNameLookup.set('AlreadyInUse', () => new AlreadyInUseError())

/**
 * UninitializedAccount: 'Uninitialized account'
 *
 * @category Errors
 * @category generated
 */
export class UninitializedAccountError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'UninitializedAccount'
  constructor() {
    super('Uninitialized account')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UninitializedAccountError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new UninitializedAccountError())
createErrorFromNameLookup.set(
  'UninitializedAccount',
  () => new UninitializedAccountError(),
)

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code)
  return createError != null ? createError() : null
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name)
  return createError != null ? createError() : null
}
