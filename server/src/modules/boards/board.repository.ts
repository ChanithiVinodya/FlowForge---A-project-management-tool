import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { nextPosition } from '../../utils/position';
import { taskSummarySelect } from '../shared/selects';
import type { CreateBoardInput, UpdateBoardInput } from './board.dto';

const boardSummarySelect = {
  id: true,
  projectId: true,
  name: true,
  position: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BoardSelect;

const boardDetailSelect = {
  ...boardSummarySelect,
  lists: {
    select: {
      id: true,
      boardId: true,
      name: true,
      position: true,
      createdAt: true,
      updatedAt: true,
      tasks: {
        select: taskSummarySelect,
        orderBy: { position: 'asc' as const },
      },
    },
    orderBy: { position: 'asc' as const },
  },
} satisfies Prisma.BoardSelect;

export async function findBoardsByProject(projectId: string) {
  return prisma.board.findMany({
    where: { projectId },
    select: boardSummarySelect,
    orderBy: { position: 'asc' },
  });
}

export async function findBoardInProject(boardId: string, projectId: string) {
  return prisma.board.findFirst({
    where: { id: boardId, projectId },
    select: boardDetailSelect,
  });
}

export async function getMaxBoardPosition(projectId: string) {
  const result = await prisma.board.aggregate({
    where: { projectId },
    _max: { position: true },
  });
  return result._max.position;
}

export async function createBoard(projectId: string, input: CreateBoardInput) {
  const position =
    input.position ?? nextPosition(await getMaxBoardPosition(projectId));

  return prisma.board.create({
    data: { projectId, name: input.name, position },
    select: boardSummarySelect,
  });
}

export async function updateBoard(boardId: string, input: UpdateBoardInput) {
  return prisma.board.update({
    where: { id: boardId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.position !== undefined && { position: input.position }),
    },
    select: boardSummarySelect,
  });
}

export async function deleteBoard(boardId: string) {
  return prisma.board.delete({ where: { id: boardId } });
}
