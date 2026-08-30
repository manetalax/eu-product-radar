export const DELETE_ACCOUNT_CONFIRMATION = 'BORRAR';

export const ACCOUNT_DELETION_ERROR_CODES = [
  'origin_not_allowed',
  'session_expired',
  'invalid_confirmation',
  'email_mismatch',
  'confirmation_mismatch',
  'delete_failed',
] as const;

export type AccountDeletionErrorCode = typeof ACCOUNT_DELETION_ERROR_CODES[number];

export class AccountDeletionError extends Error {
  constructor(public readonly code: AccountDeletionErrorCode) {
    super(code);
    this.name = 'AccountDeletionError';
  }
}

export type AccountDeletionRequest = {
  email: string;
  confirmation: string;
};

export function accountDeletionRequest(body: unknown, accountEmail: string): AccountDeletionRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AccountDeletionError('invalid_confirmation');
  }

  const { email, confirmation } = body as Record<string, unknown>;
  if (typeof email !== 'string' || email.trim().toLocaleLowerCase('en-US') !== accountEmail.trim().toLocaleLowerCase('en-US')) {
    throw new AccountDeletionError('email_mismatch');
  }
  if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    throw new AccountDeletionError('confirmation_mismatch');
  }

  return { email: email.trim(), confirmation };
}
