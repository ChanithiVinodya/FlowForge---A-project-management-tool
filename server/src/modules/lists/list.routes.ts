import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { boardIdParamSchema, listIdParamSchema } from '../shared/params.dto';
import taskListRoutes from '../tasks/task-list.routes';
import * as listController from './list.controller';
import { createListSchema, reorderListsSchema, updateListSchema } from './list.dto';

const router = Router({ mergeParams: true });

router.get('/', validate(boardIdParamSchema, 'params'), listController.list);
router.post('/', validate(boardIdParamSchema, 'params'), validate(createListSchema), listController.create);

router.patch(
  '/reorder',
  validate(boardIdParamSchema, 'params'),
  validate(reorderListsSchema),
  listController.reorder,
);

router.patch(
  '/:listId',
  validate(listIdParamSchema, 'params'),
  validate(updateListSchema),
  listController.update,
);

router.delete(
  '/:listId',
  validate(listIdParamSchema, 'params'),
  listController.remove,
);

router.use('/:listId/tasks', taskListRoutes);

export default router;
