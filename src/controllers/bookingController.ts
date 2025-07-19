import { Request, Response } from 'express';
import { createBookingSchema } from '../validators/bookingValidator';
import { 
  createBooking as createBookingService, 
  getUserBookings, 
  getBookingById, 
  deleteBooking, 
  checkExistingBooking,
  getEventBookingCount 
} from '../services/bookingService';
import { getEventById } from '../services/eventService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const { eventId } = parsed.data;
    const userId = req.user!.id;

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot book past events' });
    }

    // Check if user already booked this event
    const existingBooking = await checkExistingBooking(eventId, userId);
    if (existingBooking) {
      return res.status(409).json({ message: 'Already booked this event' });
    }

    // Check capacity
    const bookingCount = await getEventBookingCount(eventId);
    if (bookingCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const booking = await createBookingService({ eventId, userId });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookings = await getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await deleteBooking(id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 