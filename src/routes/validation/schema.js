import { z } from 'zod';

export const schema = z.object({
  favourite: z.string().nullable(),
	tags: z.string().min(1).array().min(2, '🎨 Must select at least 2 colors !')
});
