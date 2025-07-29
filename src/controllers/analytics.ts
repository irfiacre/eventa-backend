import { Request, Response } from "express";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/eventValidator";
import { getUserEventsBooking as getUserEventsBookings } from "../services/eventService";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const getAdminAnalyticsEvents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const events = await getUserEventsBookings(userId);
    let bookingsCount = 0;
    let earnings = 0;
        

    for (const elt of events) {
      if (elt.bookings){
        for (const _ in elt.bookings) {
          earnings += elt.price
          bookingsCount += 1
        }
      }
    }

    res.json({
      events: events.length,
      bookings: bookingsCount,
      earnings
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
