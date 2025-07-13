import { z } from 'zod';

export const fileSchema = z.object({
  size: z.number(),
  buffer: z.instanceof(Buffer),
  mimetype: z.string(),
  originalname: z.string(),
  fieldname: z.string(),
});
