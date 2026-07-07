import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { listIdParamSchema } from '../shared/params.dto';
import * as taskListController from './task-list.controller';
import { createTaskSchema } from './task.dto';

const router = Router({ mergeParams: true });

router.get('/', validate(listIdParamSchema, 'params'), taskListController.list);
router.post(
  '/',
  validate(listIdParamSchema, 'params'),
  validate(createTaskSchema),
  taskListController.create,
);

export default router;
