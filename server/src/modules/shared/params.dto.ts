import { z } from 'zod';

export const uuidParam = z.string().uuid('Invalid ID format');

export const projectIdParamSchema = z.object({
  projectId: uuidParam,
});

export const boardIdParamSchema = projectIdParamSchema.extend({
  boardId: uuidParam,
});

export const listIdParamSchema = boardIdParamSchema.extend({
  listId: uuidParam,
});

export const taskIdParamSchema = projectIdParamSchema.extend({
  taskId: uuidParam,
});

export const memberIdParamSchema = projectIdParamSchema.extend({
  userId: uuidParam,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
