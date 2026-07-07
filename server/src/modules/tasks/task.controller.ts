import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { emitToProject, WsEvent } from '../../websocket/events';
import * as taskService from './task.service';

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTask(req.params.projectId, req.params.taskId);
  res.status(200).json({ task });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const task = await taskService.updateTask(projectId, taskId, req.user!.id, req.body);
  
  emitToProject(projectId, WsEvent.TASK_UPDATED, { taskId, task });
  
  res.status(200).json({ task });
});

export const move = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const task = await taskService.moveTask(projectId, taskId, req.user!.id, req.body);
  
  emitToProject(projectId, WsEvent.TASK_MOVED, { taskId, task });
  
  res.status(200).json({ task });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  await taskService.deleteTask(projectId, taskId, req.user!.id);
  
  emitToProject(projectId, WsEvent.TASK_DELETED, { taskId });
  
  res.status(204).send();
});
