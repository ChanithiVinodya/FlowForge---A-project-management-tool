import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as attachmentsService from './attachments.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  const attachments = await attachmentsService.listAttachments(projectId, taskId);
  res.status(200).json({ attachments });
});

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const attachment = await attachmentsService.uploadAttachment(
    projectId,
    taskId,
    req.user!.id,
    req.file,
  );
  res.status(201).json({ attachment });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, taskId, attachmentId } = req.params;
  await attachmentsService.removeAttachment(projectId, taskId, attachmentId, req.user!.id);
  res.status(204).send();
});
