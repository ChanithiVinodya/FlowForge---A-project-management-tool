import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireProjectRole } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  memberIdParamSchema,
  projectIdParamSchema,
} from '../shared/params.dto';
import boardRoutes from '../boards/board.routes';
import taskRoutes from '../tasks/task.routes';
import commentRoutes from '../comments/comments.routes';
import attachmentRoutes from '../attachments/attachments.routes';
import activityRoutes from '../activities/activity.routes';
import * as projectController from './project.controller';
import {
  createProjectSchema,
  inviteMemberSchema,
  listProjectsQuerySchema,
  updateMemberRoleSchema,
  updateProjectSchema,
} from './project.dto';

const router = Router();

router.use(authenticate);

router.get('/', validate(listProjectsQuerySchema, 'query'), projectController.list);
router.post('/', validate(createProjectSchema), projectController.create);

router.get(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole(),
  projectController.getOne,
);

router.patch(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole('OWNER', 'ADMIN'),
  validate(updateProjectSchema),
  projectController.update,
);

router.delete(
  '/:projectId',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole('OWNER'),
  projectController.remove,
);

router.get(
  '/:projectId/members',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole(),
  projectController.listMembers,
);

router.post(
  '/:projectId/members',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole('OWNER', 'ADMIN'),
  validate(inviteMemberSchema),
  projectController.inviteMember,
);

router.patch(
  '/:projectId/members/:userId',
  validate(memberIdParamSchema, 'params'),
  requireProjectRole('OWNER'),
  validate(updateMemberRoleSchema),
  projectController.updateMemberRole,
);

router.delete(
  '/:projectId/members/:userId',
  validate(memberIdParamSchema, 'params'),
  requireProjectRole('OWNER', 'ADMIN'),
  projectController.removeMember,
);

router.use(
  '/:projectId/boards',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole(),
  boardRoutes,
);

router.use(
  '/:projectId/tasks',
  validate(projectIdParamSchema, 'params'),
  requireProjectRole(),
  taskRoutes,
);

// Nested comment and attachment routes under tasks
router.use('/:projectId/tasks/:taskId/comments', commentRoutes);
router.use('/:projectId/tasks/:taskId/attachments', attachmentRoutes);

// Project activity log
router.use('/:projectId/activities', validate(projectIdParamSchema, 'params'), requireProjectRole(), activityRoutes);

export default router;
