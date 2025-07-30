import { Request, Response } from "express";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/eventValidator";
import {
  createEvent as createEventService,
  getAllEvents as getAllEventsService,
  getEventById as getEventByIdService,
  updateEvent as updateEventService,
  getEventBookings as getEventBookingsService,
  deleteAnEvent as deleteEventService,
} from "../services/eventService";
import { BookingCustomType } from "../utils/customTypes";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await getAllEventsService();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await getEventByIdService(id);

    const bookingsDetails = {
      confirmed:
        event?.bookings.filter(
          (booking: any) => booking.status === "confirmed"
        ) || [],
      pending:
        event?.bookings.filter(
          (booking: any) => booking.status === "pending"
        ) || [],
    };
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({
      ...event,
      bookingsDetails,
      sits:
        event.capacity -
        (bookingsDetails.confirmed.length + bookingsDetails.pending.length),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const eventData = {
      ...parsed.data,
      date: new Date(parsed.data.date),
      userId: req.user!.id,
    };
    const event = await createEventService(eventData);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const updateData: any = { ...parsed.data };
    if (parsed.data.date) {
      updateData.date = new Date(parsed.data.date);
    }
    const event = await updateEventService(id, updateData);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const event = await deleteEventService(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventBookings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookings = await getEventBookingsService(id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
