import { z } from 'zod';

export const createCommentSchema = z.object({
    author: z.string().trim().min(1).max(100),
    text: z.string().trim().min(1).max(1000),
});

export interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
}

export const comments = new Map<string, Comment>();