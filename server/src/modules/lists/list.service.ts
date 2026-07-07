import { ApiError } from '../../utils/ApiError';
import * as boardRepo from '../boards/board.repository';
import * as listRepo from './list.repository';
import type { CreateListInput, ReorderListsInput, UpdateListInput } from './list.dto';

async function assertBoardInProject(projectId: string, boardId: string) {
  const board = await boardRepo.findBoardInProject(boardId, projectId);
  if (!board) throw ApiError.notFound('Board not found');
  return board;
}

export async function listLists(projectId: string, boardId: string) {
  await assertBoardInProject(projectId, boardId);
  return listRepo.findListsByBoard(boardId);
}

export async function getList(projectId: string, boardId: string, listId: string) {
  const list = await listRepo.findListInBoard(listId, boardId, projectId);
  if (!list) throw ApiError.notFound('List not found');
  return list;
}

export async function createList(projectId: string, boardId: string, input: CreateListInput) {
  await assertBoardInProject(projectId, boardId);
  return listRepo.createList(boardId, input);
}

export async function updateList(
  projectId: string,
  boardId: string,
  listId: string,
  input: UpdateListInput,
) {
  await getList(projectId, boardId, listId);
  return listRepo.updateList(listId, input);
}

export async function deleteList(projectId: string, boardId: string, listId: string) {
  await getList(projectId, boardId, listId);
  await listRepo.deleteList(listId);
}

export async function reorderLists(
  projectId: string,
  boardId: string,
  input: ReorderListsInput,
) {
  await assertBoardInProject(projectId, boardId);
  const result = await listRepo.reorderLists(boardId, input);
  if (!result.valid) {
    throw ApiError.badRequest(result.reason);
  }
  return result.lists;
}
