export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export const comments = new Map<string, Comment>();

export const createComment = {
  body: {
    type: 'object',
    required: ['author', 'text'],
    additionalProperties: false,
    properties: {
      author: { type: 'string', minLength: 1, maxLength: 100, pattern: '\\S' },
      text: { type: 'string', minLength: 1, maxLength: 1000, pattern: '\\S' },
    },
  },
};
