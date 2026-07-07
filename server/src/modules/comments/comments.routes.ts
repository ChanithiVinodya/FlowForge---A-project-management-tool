import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireProjectRole } from '../../middleware/authorize';
import * as commentsController from './comments.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireProjectRole());

router.get('/', commentsController.list);
router.post('/', commentsController.create);
router.patch('/:commentId', commentsController.update);
router.delete('/:commentId', commentsController.remove);

export default router;
