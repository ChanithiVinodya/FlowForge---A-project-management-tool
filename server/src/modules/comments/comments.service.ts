import { ActivityAction, NotificationType } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import * as commentRepo from './comments.repository';
import * as taskRepo from '../tasks/task.repository';
import { logActivity } from '../activities/activity.service';
import { createNotification } from '../notifications/notification.service';
import { emitToProject, WsEvent } from '../../websocket/events';

export async function listComments(projectId: string, taskId: string) {
  const task = await taskRepo.findTaskInProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');
  return commentRepo.findCommentsByTask(taskId);
}

export async function addComment(
  projectId: string,
  taskId: string,
  authorId: string,
  body: string,
) {
  const task = await taskRepo.findTaskInProject(taskId, projectId);
  if (!task) throw ApiError.notFound('Task not found');

  const comment = await commentRepo.createComment({ taskId, authorId, body });

  await logActivity({
    projectId,
    actorId: authorId,
    action: ActivityAction.COMMENT_ADDED,
    taskId,
    metadata: { commentId: comment.id },
  });

  // Notify task assignee if different from commenter
  if (task.assigneeId && task.assigneeId !== authorId) {
    await createNotification(task.assigneeId, NotificationType.COMMENT_ADDED, {
      taskId,
      taskTitle: task.title,
      projectId,
      commentId: comment.id,
    });
  }

  // Emit real-time update
  emitToProject(projectId, WsEvent.COMMENT_ADDED, { taskId, comment });

  return comment;
}

export async function editComment(
  commentId: string,
  userId: string,
  body: string,
) {
  const existing = await commentRepo.findCommentById(commentId);
  if (!existing) throw ApiError.notFound('Comment not found');
  if (existing.authorId !== userId) throw ApiError.forbidden('Cannot edit another user\'s comment');

  return commentRepo.updateComment(commentId, body);
}

export async function removeComment(commentId: string, userId: string) {
  const existing = await commentRepo.findCommentById(commentId);
  if (!existing) throw ApiError.notFound('Comment not found');
  if (existing.authorId !== userId) throw ApiError.forbidden('Cannot delete another user\'s comment');
  await commentRepo.deleteComment(commentId);
}
