import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  position: z.number().optional(),
});

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  position: z.number().optional(),
});

export const reorderListsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1, 'At least one list ID is required'),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type ReorderListsInput = z.infer<typeof reorderListsSchema>;
