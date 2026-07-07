import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { nextPosition } from '../../utils/position';
import { publicUserSelect, taskSummarySelect } from '../shared/selects';
import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from './task.dto';

const taskDetailSelect = {
  ...taskSummarySelect,
  createdBy: { select: publicUserSelect },
  list: {
    select: {
      id: true,
      boardId: true,
      board: { select: { id: true, projectId: true } },
    },
  },
} satisfies Prisma.TaskSelect;

export async function findTasksByList(listId: string) {
  return prisma.task.findMany({
    where: { listId },
    select: taskSummarySelect,
    orderBy: { position: 'asc' },
  });
}

export async function findTaskInProject(taskId: string, projectId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      list: { board: { projectId } },
    },
    select: taskDetailSelect,
  });
}

export async function findListInProject(listId: string, projectId: string) {
  return prisma.list.findFirst({
    where: { id: listId, board: { projectId } },
    select: { id: true, boardId: true },
  });
}

export async function isProjectMember(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { id: true },
  });
  return Boolean(member);
}

export async function getMaxTaskPosition(listId: string) {
  const result = await prisma.task.aggregate({
    where: { listId },
    _max: { position: true },
  });
  return result._max.position;
}

function buildLabelCreate(labels: CreateTaskInput['labels']) {
  if (!labels?.length) return undefined;
  return { create: labels.map((label) => ({ name: label.name, color: label.color })) };
}

export async function createTask(
  listId: string,
  createdById: string,
  input: CreateTaskInput,
) {
  const position = input.position ?? nextPosition(await getMaxTaskPosition(listId));

  return prisma.task.create({
    data: {
      listId,
      title: input.title,
      description: input.description,
      position,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ?? undefined,
      assigneeId: input.assigneeId ?? undefined,
      createdById,
      labels: buildLabelCreate(input.labels),
    },
    select: taskSummarySelect,
  });
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const { labels, ...fields } = input;

  return prisma.$transaction(async (tx) => {
    if (labels !== undefined) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      if (labels.length > 0) {
        await tx.taskLabel.createMany({
          data: labels.map((label) => ({
            taskId,
            name: label.name,
            color: label.color,
          })),
        });
      }
    }

    return tx.task.update({
      where: { id: taskId },
      data: {
        ...(fields.title !== undefined && { title: fields.title }),
        ...(fields.description !== undefined && { description: fields.description }),
        ...(fields.position !== undefined && { position: fields.position }),
        ...(fields.priority !== undefined && { priority: fields.priority }),
        ...(fields.status !== undefined && { status: fields.status }),
        ...(fields.dueDate !== undefined && { dueDate: fields.dueDate }),
        ...(fields.assigneeId !== undefined && { assigneeId: fields.assigneeId }),
        ...(fields.listId !== undefined && { listId: fields.listId }),
      },
      select: taskSummarySelect,
    });
  });
}

export async function moveTask(taskId: string, input: MoveTaskInput) {
  return prisma.task.update({
    where: { id: taskId },
    data: { listId: input.listId, position: input.position },
    select: taskSummarySelect,
  });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({ where: { id: taskId } });
}
