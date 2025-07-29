import { Router } from 'express';
import { getAdminAnalyticsEvents} from '../controllers/analytics';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize(['admin']), getAdminAnalyticsEvents);

export default router;
