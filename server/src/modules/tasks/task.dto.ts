import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

const taskLabelInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code like #FF5733'),
});

const taskFieldsSchema = {
  title: z.string().trim().min(1, 'Title is required').max(500),
  description: z.string().trim().max(10000).optional(),
  position: z.number().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  labels: z.array(taskLabelInputSchema).max(20).optional(),
};

export const createTaskSchema = z.object(taskFieldsSchema);

export const updateTaskSchema = z
  .object({
    title: taskFieldsSchema.title.optional(),
    description: taskFieldsSchema.description.nullable().optional(),
    position: taskFieldsSchema.position.optional(),
    priority: taskFieldsSchema.priority.optional(),
    status: taskFieldsSchema.status.optional(),
    dueDate: taskFieldsSchema.dueDate,
    assigneeId: taskFieldsSchema.assigneeId,
    listId: z.string().uuid().optional(),
    labels: taskFieldsSchema.labels.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const moveTaskSchema = z.object({
  listId: z.string().uuid(),
  position: z.number(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
