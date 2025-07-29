import { Router } from 'express';
import { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  getEventBookings, 
  deleteEvent
} from '../controllers/eventController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', authenticate, authorize(['admin']), createEvent);
router.put('/:id', authenticate, authorize(['admin']), updateEvent);
// router.delete('/:id', authenticate, authorize(['admin']), deleteEvent);
router.get('/:id/bookings', authenticate, authorize(['admin']), getEventBookings);

export default router;
