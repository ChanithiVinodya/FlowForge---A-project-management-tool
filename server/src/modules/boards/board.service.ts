import { ApiError } from '../../utils/ApiError';
import * as boardRepo from './board.repository';
import type { CreateBoardInput, UpdateBoardInput } from './board.dto';

export async function listBoards(projectId: string) {
  return boardRepo.findBoardsByProject(projectId);
}

export async function getBoard(projectId: string, boardId: string) {
  const board = await boardRepo.findBoardInProject(boardId, projectId);
  if (!board) throw ApiError.notFound('Board not found');
  return board;
}

export async function createBoard(projectId: string, input: CreateBoardInput) {
  return boardRepo.createBoard(projectId, input);
}

export async function updateBoard(projectId: string, boardId: string, input: UpdateBoardInput) {
  await getBoard(projectId, boardId);
  return boardRepo.updateBoard(boardId, input);
}

export async function deleteBoard(projectId: string, boardId: string) {
  await getBoard(projectId, boardId);
  await boardRepo.deleteBoard(boardId);
}
