import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { emitToProject, WsEvent } from '../../websocket/events';
import * as listService from './list.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const lists = await listService.listLists(req.params.projectId, req.params.boardId);
  res.status(200).json({ lists });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, boardId } = req.params;
  const list = await listService.createList(projectId, boardId, req.body);
  
  emitToProject(projectId, WsEvent.LIST_CREATED, { boardId, list });
  
  res.status(201).json({ list });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, boardId, listId } = req.params;
  const list = await listService.updateList(projectId, boardId, listId, req.body);
  
  emitToProject(projectId, WsEvent.LIST_UPDATED, { boardId, listId, list });
  
  res.status(200).json({ list });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, boardId, listId } = req.params;
  await listService.deleteList(projectId, boardId, listId);
  
  emitToProject(projectId, WsEvent.LIST_DELETED, { boardId, listId });
  
  res.status(204).send();
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, boardId } = req.params;
  const lists = await listService.reorderLists(projectId, boardId, req.body);
  
  emitToProject(projectId, WsEvent.LIST_REORDERED as any, { boardId, lists }); // Assuming LIST_REORDERED added to WsEvent
  
  res.status(200).json({ lists });
});
