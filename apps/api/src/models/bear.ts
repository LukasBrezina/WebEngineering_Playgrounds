import { z } from 'zod';

export const BearSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  binomial: z.string().min(1),
  imageUrl: z.string().min(1),
  range: z.string().min(1),
});

export const BearsSchema = z
  .array(BearSchema)
  .min(1)
  .refine((bears) => new Set(bears.map((b) => b.id)).size === bears.length);

export type Bear = z.infer<typeof BearSchema>;

export interface ParsedBear {
  name: string;
  binomial: string;
  fileName: string;
  range: string;
}
