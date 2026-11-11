import { z } from 'zod';

// RFC 9457
export const ProblemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.int(),
    detail: z.string(),
    instance: z.string(),
    errors: z
      .array(z.object({ pointer: z.string(), message: z.string() }))
      .optional(),
  })
  .meta({ id: 'Problem' });

export type Problem = z.infer<typeof ProblemSchema>;
