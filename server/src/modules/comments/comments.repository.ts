import { prisma } from '../../config/prisma';
import { publicUserSelect } from '../shared/selects';

const commentSelect = {
  id: true,
  taskId: true,
  body: true,
  createdAt: true,
  editedAt: true,
  author: { select: publicUserSelect },
} as const;

export async function findCommentsByTask(taskId: string) {
  return prisma.comment.findMany({
    where: { taskId },
    select: commentSelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function findCommentById(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: { ...commentSelect, authorId: true },
  });
}

export async function createComment(data: { taskId: string; authorId: string; body: string }) {
  return prisma.comment.create({ data, select: commentSelect });
}

export async function updateComment(commentId: string, body: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { body, editedAt: new Date() },
    select: commentSelect,
  });
}

export async function deleteComment(commentId: string) {
  return prisma.comment.delete({ where: { id: commentId } });
}
