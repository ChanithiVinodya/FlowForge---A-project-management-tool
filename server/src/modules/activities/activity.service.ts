import { prisma } from '../../config/prisma';
import { ActivityAction } from '@prisma/client';
import { logger } from '../../config/logger';

export interface LogActivityParams {
  projectId: string;
  actorId: string;
  action: ActivityAction;
  taskId?: string;
  metadata?: any;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        projectId: params.projectId,
        actorId: params.actorId,
        action: params.action,
        taskId: params.taskId,
        metadata: params.metadata,
      },
    });
    return log;
  } catch (err) {
    logger.error({ err, params }, 'Failed to log activity');
    return null;
  }
}
