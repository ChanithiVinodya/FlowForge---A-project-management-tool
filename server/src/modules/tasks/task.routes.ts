import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { taskIdParamSchema } from '../shared/params.dto';
import * as taskController from './task.controller';
import { moveTaskSchema, updateTaskSchema } from './task.dto';

const router = Router({ mergeParams: true });

router.get('/:taskId', validate(taskIdParamSchema, 'params'), taskController.getOne);

router.patch(
  '/:taskId',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  taskController.update,
);

router.patch(
  '/:taskId/move',
  validate(taskIdParamSchema, 'params'),
  validate(moveTaskSchema),
  taskController.move,
);

router.delete('/:taskId', validate(taskIdParamSchema, 'params'), taskController.remove);

export default router;
