import { prisma } from '../../config/prisma';
import { publicUserSelect } from '../shared/selects';

const attachmentSelect = {
  id: true,
  taskId: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  size: true,
  createdAt: true,
  uploader: { select: publicUserSelect },
} as const;

export async function findAttachmentsByTask(taskId: string) {
  return prisma.attachment.findMany({
    where: { taskId },
    select: attachmentSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function findAttachmentById(attachmentId: string) {
  return prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: { ...attachmentSelect, uploadedBy: true },
  });
}

export async function createAttachment(data: {
  taskId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: number;
}) {
  return prisma.attachment.create({
    data,
    select: attachmentSelect,
  });
}

export async function deleteAttachment(attachmentId: string) {
  return prisma.attachment.delete({ where: { id: attachmentId } });
}
