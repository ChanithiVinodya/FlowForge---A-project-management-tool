import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  position: z.number().optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  position: z.number().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
