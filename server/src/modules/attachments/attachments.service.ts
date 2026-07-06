import path from 'path';
import fs from 'fs';
import { ApiError } from '../../utils/ApiError';
import { UPLOAD_DIR } from '../../config/upload';
import * as attachmentRepo from './attachments.repository';
import * as taskRepo from '../tasks/task.repository';
import { logActivity } from '../activities/activity.service';
import { ActivityAction } from '@prisma/client';
import { env } from '../../config/env';

function fileUrl(filename: string): string {
  // In production this would be a CDN/S3 URL; for now serve from the API
  return `${env.CLIENT_ORIGIN.replace(':5173', ':4000')}/uploads/${filename}`;
}

export async function listAttachments(projectId: string, taskId: string) {
  const task = await taskRepo.findTaskInProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');
  return attachmentRepo.findAttachmentsByTask(taskId);
}

export async function uploadAttachment(
  projectId: string,
  taskId: string,
  uploaderId: string,
  file: Express.Multer.File,
) {
  const task = await taskRepo.findTaskInProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');

  const attachment = await attachmentRepo.createAttachment({
    taskId,
    uploadedBy: uploaderId,
    fileName: file.originalname,
    fileUrl: fileUrl(file.filename),
    fileType: file.mimetype,
    size: file.size,
  });

  await logActivity({
    projectId,
    actorId: uploaderId,
    action: ActivityAction.ATTACHMENT_ADDED,
    taskId,
    metadata: { fileName: file.originalname, size: file.size },
  });

  return attachment;
}

export async function removeAttachment(
  projectId: string,
  taskId: string,
  attachmentId: string,
  userId: string,
) {
  const attachment = await attachmentRepo.findAttachmentById(attachmentId);
  if (!attachment || attachment.taskId !== taskId) {
    throw ApiError.notFound('Attachment not found');
  }
  if (attachment.uploadedBy !== userId) {
    throw ApiError.forbidden('Only the uploader can delete this attachment');
  }

  // Delete from disk
  const filename = path.basename(attachment.fileUrl);
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await attachmentRepo.deleteAttachment(attachmentId);

  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.ATTACHMENT_REMOVED,
    taskId,
    metadata: { fileName: attachment.fileName },
  });
}
