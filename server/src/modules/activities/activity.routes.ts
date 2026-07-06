// Activity Routes
import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireProjectRole } from '../../middleware/authorize';
import * as activityController from './activity.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Mounted at /api/projects/:projectId/activities (via project.routes.ts)
router.get('/', requireProjectRole(), activityController.listByProject);

export default router;
