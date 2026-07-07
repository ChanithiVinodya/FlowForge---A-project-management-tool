import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { nextPosition, positionAtIndex } from '../../utils/position';
import type { CreateListInput, ReorderListsInput, UpdateListInput } from './list.dto';

const listSelect = {
  id: true,
  boardId: true,
  name: true,
  position: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ListSelect;

export async function findListsByBoard(boardId: string) {
  return prisma.list.findMany({
    where: { boardId },
    select: listSelect,
    orderBy: { position: 'asc' },
  });
}

export async function findListInBoard(listId: string, boardId: string, projectId: string) {
  return prisma.list.findFirst({
    where: { id: listId, boardId, board: { projectId } },
    select: listSelect,
  });
}

export async function getMaxListPosition(boardId: string) {
  const result = await prisma.list.aggregate({
    where: { boardId },
    _max: { position: true },
  });
  return result._max.position;
}

export async function createList(boardId: string, input: CreateListInput) {
  const position = input.position ?? nextPosition(await getMaxListPosition(boardId));

  return prisma.list.create({
    data: { boardId, name: input.name, position },
    select: listSelect,
  });
}

export async function updateList(listId: string, input: UpdateListInput) {
  return prisma.list.update({
    where: { id: listId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.position !== undefined && { position: input.position }),
    },
    select: listSelect,
  });
}

export async function deleteList(listId: string) {
  return prisma.list.delete({ where: { id: listId } });
}

export async function reorderLists(boardId: string, input: ReorderListsInput) {
  const existing = await prisma.list.findMany({
    where: { boardId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((list) => list.id));
  if (input.orderedIds.length !== existing.length) {
    return { valid: false as const, reason: 'orderedIds must include every list on the board' };
  }

  for (const id of input.orderedIds) {
    if (!existingIds.has(id)) {
      return { valid: false as const, reason: 'orderedIds contains a list that does not belong to this board' };
    }
  }

  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.list.update({
        where: { id },
        data: { position: positionAtIndex(index) },
      }),
    ),
  );

  const lists = await findListsByBoard(boardId);
  return { valid: true as const, lists };
}
