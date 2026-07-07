import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { emitToProject, WsEvent } from '../../websocket/events';
import * as taskService from './task.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.listTasks(
    req.params.projectId,
    req.params.boardId,
    req.params.listId,
  );
  res.status(200).json({ tasks });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, boardId, listId } = req.params;
  const task = await taskService.createTask(
    projectId,
    boardId,
    listId,
    req.user!.id,
    req.body,
  );
  
  emitToProject(projectId, WsEvent.TASK_CREATED, { boardId, listId, task });
  
  res.status(201).json({ task });
});
