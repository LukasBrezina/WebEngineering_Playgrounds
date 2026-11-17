import { z } from 'zod';
import { BadRequestError } from '../errors/errors.js';
import type { CommentKey } from '../repositories/types.js';

// The cursor is opaque for the client: base64url(JSON { createdAt, id }).
// The client only passes back the nextCursor it received.
const CommentKeySchema = z.object({
  createdAt: z.iso.datetime(),
  id: z.uuid(),
});

export const encodeCursor = (key: CommentKey): string =>
  Buffer.from(JSON.stringify(key), 'utf8').toString('base64url');

export const decodeCursor = (cursor: string): CommentKey => {
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw new BadRequestError('Invalid cursor');
  }
  const result = CommentKeySchema.safeParse(decoded);
  if (!result.success) throw new BadRequestError('Invalid cursor');
  return result.data;
};
