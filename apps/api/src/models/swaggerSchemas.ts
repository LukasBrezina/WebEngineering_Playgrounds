import { z } from 'zod';
import { BearSchema } from './bear.js';
import { createComment } from './comments.js';

const fromZod = (schema: z.ZodType, $id: string): Record<string, unknown> => {
  const json: Record<string, unknown> = z.toJSONSchema(schema, {
    target: 'draft-7',
  });
  delete json.$schema;
  return { ...json, $id };
};

export const bearSchema = fromZod(BearSchema, 'Bear');

export const commentSchema = {
  $id: 'Comment',
  type: 'object',
  properties: {
    id: { type: 'string' },
    ...createComment.body.properties,
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const problem = {
  $id: 'Problem',
  type: 'object',
  required: ['type', 'title', 'status', 'detail', 'instance'],
  properties: {
    type: { type: 'string' },
    title: { type: 'string' },
    status: { type: 'integer' },
    detail: { type: 'string' },
    instance: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pointer: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};
