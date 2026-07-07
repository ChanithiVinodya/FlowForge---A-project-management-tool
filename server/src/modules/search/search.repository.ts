import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { publicUserSelect, taskLabelSelect } from '../shared/selects';

export interface TaskSearchFilters {
  q?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export async function searchTasks(userId: string, filters: TaskSearchFilters) {
  const where: Prisma.TaskWhereInput = {
    // Only search tasks in projects the user belongs to
    list: {
      board: {
        project: {
          members: { some: { userId } },
          ...(filters.projectId ? { id: filters.projectId } : {}),
        },
      },
    },
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.dueBefore || filters.dueAfter) {
    where.dueDate = {
      ...(filters.dueBefore ? { lte: new Date(filters.dueBefore) } : {}),
      ...(filters.dueAfter ? { gte: new Date(filters.dueAfter) } : {}),
    };
  }

  return prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      listId: true,
      assigneeId: true,
      createdAt: true,
      assignee: { select: publicUserSelect },
      labels: { select: taskLabelSelect },
      list: {
        select: {
          id: true,
          name: true,
          board: {
            select: {
              id: true,
              name: true,
              project: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
}
