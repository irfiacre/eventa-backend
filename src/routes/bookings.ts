import { Router } from 'express';
import { createBooking, getMyBookings, updateBooking } from '../controllers/bookingController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Customer routes (require authentication and customer role)
router.post('/', authenticate, authorize(['customer']), createBooking);
router.get('/', authenticate, authorize(['customer']), getMyBookings);
router.put('/:id', authenticate, authorize(['customer']), updateBooking);

export default router;
