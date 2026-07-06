/**
 * Activity Controller
 */
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { prisma } from '../../config/prisma';

export const listByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  
  const activities = await prisma.activityLog.findMany({
    where: { projectId },
    include: {
      actor: {
        select: { id: true, name: true, avatarUrl: true }
      },
      task: {
        select: { id: true, title: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.status(200).json({ activities });
});
