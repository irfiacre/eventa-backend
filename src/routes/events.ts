import { Router } from 'express';
import { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  getEventBookings 
} from '../controllers/eventController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin routes
router.post('/', authenticate, authorize(['admin']), createEvent);
router.put('/:id', authenticate, authorize(['admin']), updateEvent);
router.get('/:id/bookings', authenticate, authorize(['admin']), getEventBookings);

export default router; 