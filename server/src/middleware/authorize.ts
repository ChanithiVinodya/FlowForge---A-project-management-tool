import { NextFunction, Request, Response } from 'express';
import { ProjectRole } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/prisma';

// Project membership + role check. Must run AFTER `authenticate`.
// Reads :projectId from the route params, so mount project-scoped routers
// as e.g. router.use('/projects/:projectId/...', authenticate, requireProjectRole()).
//
// requireProjectRole() with no args = "must be a member, any role".
// requireProjectRole('ADMIN', 'OWNER') = "must have one of these roles".
export function requireProjectRole(...allowedRoles: ProjectRole[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(ApiError.unauthorized());
      }

      const projectId = req.params.projectId;
      if (!projectId) {
        return next(ApiError.badRequest('projectId param is required for this route'));
      }

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.user.id } },
      });

      if (!membership) {
        return next(ApiError.forbidden('You are not a member of this project'));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return next(ApiError.forbidden('You do not have permission to perform this action'));
      }

      req.projectRole = membership.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
