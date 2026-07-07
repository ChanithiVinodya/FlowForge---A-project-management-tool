import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as commentsService from './comments.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const comments = await commentsService.listComments(projectId, taskId);
  res.status(200).json({ comments });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const comment = await commentsService.addComment(
    projectId,
    taskId,
    req.user!.id,
    req.body.body,
  );
  res.status(201).json({ comment });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const comment = await commentsService.editComment(commentId, req.user!.id, req.body.body);
  res.status(200).json({ comment });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  await commentsService.removeComment(commentId, req.user!.id);
  res.status(204).send();
});
