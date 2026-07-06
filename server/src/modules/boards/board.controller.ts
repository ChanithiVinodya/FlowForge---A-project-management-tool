import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as boardService from './board.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const boards = await boardService.listBoards(req.params.projectId);
  res.status(200).json({ boards });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.createBoard(req.params.projectId, req.body);
  res.status(201).json({ board });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.getBoard(req.params.projectId, req.params.boardId);
  res.status(200).json({ board });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const board = await boardService.updateBoard(
    req.params.projectId,
    req.params.boardId,
    req.body,
  );
  res.status(200).json({ board });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await boardService.deleteBoard(req.params.projectId, req.params.boardId);
  res.status(204).send();
});
