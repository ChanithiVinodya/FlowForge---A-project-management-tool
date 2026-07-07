import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { prisma } from '../../config/prisma';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.status(200).json({ notifications });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.update({
    where: { 
      id: req.params.id,
      userId: req.user!.id // Ensure user owns the notification
    },
    data: { isRead: true },
  });

  res.status(200).json({ notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { 
      userId: req.user!.id,
      isRead: false
    },
    data: { isRead: true },
  });

  res.status(204).send();
});
