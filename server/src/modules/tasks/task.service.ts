import { ActivityAction, NotificationType, TaskStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import * as listRepo from '../lists/list.repository';
import * as taskRepo from './task.repository';
import { logActivity } from '../activities/activity.service';
import { createNotification } from '../notifications/notification.service';
import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from './task.dto';

async function assertListInProject(
  projectId: string,
  boardId: string,
  listId: string,
) {
  const list = await listRepo.findListInBoard(listId, boardId, projectId);
  if (!list) throw ApiError.notFound('List not found');
  return list;
}

async function assertAssigneeIsMember(projectId: string, assigneeId: string | null | undefined) {
  if (!assigneeId) return;
  const isMember = await taskRepo.isProjectMember(projectId, assigneeId);
  if (!isMember) {
    throw ApiError.badRequest('Assignee must be a member of this project');
  }
}

export async function listTasks(
  projectId: string,
  boardId: string,
  listId: string,
) {
  await assertListInProject(projectId, boardId, listId);
  return taskRepo.findTasksByList(listId);
}

export async function getTask(projectId: string, taskId: string) {
  const task = await taskRepo.findTaskInProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

export async function createTask(
  projectId: string,
  boardId: string,
  listId: string,
  userId: string,
  input: CreateTaskInput,
) {
  await assertListInProject(projectId, boardId, listId);
  await assertAssigneeIsMember(projectId, input.assigneeId);
  const task = await taskRepo.createTask(listId, userId, input);

  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.TASK_CREATED,
    taskId: task.id,
    metadata: { title: task.title },
  });

  if (task.assigneeId && task.assigneeId !== userId) {
    await createNotification(task.assigneeId, NotificationType.TASK_ASSIGNED, {
      taskId: task.id,
      title: task.title,
      projectId,
    });
  }

  return task;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  userId: string,
  input: UpdateTaskInput,
) {
  const existing = await getTask(projectId, taskId);

  if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
    await assertAssigneeIsMember(projectId, input.assigneeId);
  }

  if (input.listId !== undefined) {
    const list = await taskRepo.findListInProject(input.listId, projectId);
    if (!list) throw ApiError.notFound('Target list not found');
  }

  const updated = await taskRepo.updateTask(existing.id, input);

  // Log activity
  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.TASK_UPDATED,
    taskId: updated.id,
    metadata: { 
      changedFields: Object.keys(input),
      oldStatus: existing.status,
      newStatus: updated.status 
    },
  });

  // Notify new assignee
  if (input.assigneeId && input.assigneeId !== existing.assigneeId && input.assigneeId !== userId) {
    await createNotification(input.assigneeId, NotificationType.TASK_ASSIGNED, {
      taskId: updated.id,
      title: updated.title,
      projectId,
    });
  }

  // Notify creator if task is completed
  if (updated.status === TaskStatus.DONE && existing.status !== TaskStatus.DONE && updated.createdById !== userId) {
    await createNotification(updated.createdById, NotificationType.TASK_COMPLETED, {
      taskId: updated.id,
      title: updated.title,
      projectId,
    });
  }

  return updated;
}

export async function moveTask(projectId: string, taskId: string, userId: string, input: MoveTaskInput) {
  const task = await getTask(projectId, taskId);

  const list = await taskRepo.findListInProject(input.listId, projectId);
  if (!list) throw ApiError.notFound('Target list not found');

  const moved = await taskRepo.moveTask(taskId, input);

  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.TASK_MOVED,
    taskId: moved.id,
    metadata: { 
      fromListId: task.listId,
      toListId: moved.listId,
      position: moved.position
    },
  });

  return moved;
}

export async function deleteTask(projectId: string, taskId: string, userId: string) {
  const task = await getTask(projectId, taskId);
  
  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.TASK_DELETED,
    taskId: task.id,
    metadata: { title: task.title },
  });

  await taskRepo.deleteTask(taskId);
}
