export const DELETE_ACCOUNT_CONFIRMATION = 'BORRAR';

export type AccountDeletionRequest = {
  email: string;
  confirmation: string;
};

export function accountDeletionRequest(body: unknown, accountEmail: string): AccountDeletionRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('La confirmación de borrado no es válida.');
  }

  const { email, confirmation } = body as Record<string, unknown>;
  if (typeof email !== 'string' || email.trim().toLocaleLowerCase('en-US') !== accountEmail.trim().toLocaleLowerCase('en-US')) {
    throw new Error('Escribe el correo exacto de tu cuenta.');
  }
  if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    throw new Error(`Escribe ${DELETE_ACCOUNT_CONFIRMATION} para confirmar.`);
  }

  return { email: email.trim(), confirmation };
}
