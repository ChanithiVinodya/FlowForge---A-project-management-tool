import { Router } from 'express';
import { requireProjectRole } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { boardIdParamSchema } from '../shared/params.dto';
import listRoutes from '../lists/list.routes';
import * as boardController from './board.controller';
import { createBoardSchema, updateBoardSchema } from './board.dto';

const router = Router({ mergeParams: true });

router.get('/', boardController.list);
router.post('/', validate(createBoardSchema), boardController.create);

router.get(
  '/:boardId',
  validate(boardIdParamSchema, 'params'),
  boardController.getOne,
);

router.patch(
  '/:boardId',
  validate(boardIdParamSchema, 'params'),
  requireProjectRole('OWNER', 'ADMIN'),
  validate(updateBoardSchema),
  boardController.update,
);

router.delete(
  '/:boardId',
  validate(boardIdParamSchema, 'params'),
  requireProjectRole('OWNER', 'ADMIN'),
  boardController.remove,
);

router.use('/:boardId/lists', listRoutes);

export default router;
