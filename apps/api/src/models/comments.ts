import { z } from 'zod';

const AUTHOR_MAX = 100;
const TEXT_MAX = 1000;

export const CreateCommentSchema = z
  .strictObject({
    author: z
      .string({ error: 'Author is required' })
      .trim()
      .min(1, 'Author must not be empty')
      .max(AUTHOR_MAX, `Author must be at most ${AUTHOR_MAX} characters`),
    text: z
      .string({ error: 'Comment is required' })
      .trim()
      .min(1, 'Comment must not be empty')
      .max(TEXT_MAX, `Comment must be at most ${TEXT_MAX} characters`),
  })
  .meta({ id: 'CreateComment' });

export const CommentSchema = z
  .object({
    id: z.uuid(),
    bearId: z.string(),
    author: z.string(),
    text: z.string(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'Comment' });

export type Comment = z.infer<typeof CommentSchema>;
