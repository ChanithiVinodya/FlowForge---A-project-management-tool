import { prisma } from '../../config/prisma';
import { NotificationType } from '@prisma/client';
import { emitToUser, WsEvent } from '../../websocket/events';
import { logger } from '../../config/logger';

export async function createNotification(
  userId: string,
  type: NotificationType,
  payload: any
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        payload,
      },
    });

    // Real-time delivery
    emitToUser(userId, WsEvent.NOTIFICATION_CREATED, notification);

    return notification;
  } catch (err) {
    logger.error({ err, userId, type }, 'Failed to create notification');
    return null;
  }
}
