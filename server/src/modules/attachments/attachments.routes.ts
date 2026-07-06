import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireProjectRole } from '../../middleware/authorize';
import { upload } from '../../config/upload';
import * as attachmentsController from './attachments.controller';

const router = Router({ mergeParams: true });

router.use(authenticate, requireProjectRole());

router.get('/', attachmentsController.list);
router.post('/', upload.single('file'), attachmentsController.upload);
router.delete('/:attachmentId', attachmentsController.remove);

export default router;
