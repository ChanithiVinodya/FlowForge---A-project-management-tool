import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { searchTasks, TaskSearchFilters } from './search.repository';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    projectId,
    status,
    priority,
    assigneeId,
    dueBefore,
    dueAfter,
  } = req.query as Record<string, string | undefined>;

  const filters: TaskSearchFilters = {
    q,
    projectId,
    status: status as TaskStatus | undefined,
    priority: priority as TaskPriority | undefined,
    assigneeId,
    dueBefore,
    dueAfter,
  };

  const tasks = await searchTasks(req.user!.id, filters);
  res.status(200).json({ tasks, total: tasks.length });
});
