import { Request, Response } from "express";
import {
  createBookingSchema,
  deadlineSchema,
  updateBookingSchema,
} from "../validators/bookingValidator";
import {
  createBooking as createBookingService,
  getUserBookings,
  getBookingById,
  getEventBookingCount,
  updateBooking as updateBookingService,
  deleteUnconfirmedEvents,
  getUnconfirmedEvents,
} from "../services/bookingService";
import { getEventById } from "../services/eventService";
import { BOOKING_DEADLINE } from "../utils/constants";
import { sendEmail } from "../utils/mailHandler";

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
    const { eventId, number } = parsed.data;
    const userId = req.user!.id;

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Cannot book past events" });
    }

    const bookings = [];
    for (let i = 0; i < number; i++) {
      const bookingCount = await getEventBookingCount(eventId);
      if (bookingCount >= event.capacity) {
        if (i === 0) return res.status(400).json({ message: "Event is full" });
      }
      const result = await createBookingService({ eventId, userId });
      bookings.push(result);
    }
    const message =
      bookings.length == number
        ? "Booking(s) Done!"
        : `${bookings.length} booking(s) was made.`;
    res.status(201).json({
      message: `${message}. Please confirm booking(s) ASAP. Booking can be hold for a day.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookings = await getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // const userId = req.user!.id;
    let booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const parsed = updateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    booking = await updateBookingService(id, parsed.data);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking status updated successfully",
      result: booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const remindPendingBookings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = deadlineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const { days } = parsed.data;

    const unconfirmedBookings = await getUnconfirmedEvents(days);
    const result: any = [];

    for (const unconfirmedBooking of unconfirmedBookings) {
      const clientEmail = unconfirmedBooking.user.email;
      console.info("Sending An email to", clientEmail);
      const emailSent = await sendEmail({
        email: clientEmail,
        subject: "eVENTA - Reminder to Confirm Booking",
        message: `Please confirm this booking before 2 hours after seeing this message. Otherwise this booking will be deleted.
        Booking is for event ${unconfirmedBooking.event.title}, with an ID ${unconfirmedBooking.id}. Thank you`,
        title: `Reminder to Confirm Booking for ${unconfirmedBooking.event.title} Event`,
      });
      if (emailSent) {
        result.push(
          `Successfully sent email to ${clientEmail} for booking - ${unconfirmedBooking.id}`
        );
      } else {
        result.push(
          `Unable to send email to ${clientEmail} for booking - ${unconfirmedBooking.id}`
        );
      }
    }
    res.status(200).json({
      message: `Done`,
      result: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteUnconfirmedBookings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = deadlineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    const { days } = parsed.data;
    await deleteUnconfirmedEvents(days);
    res.status(200).json({
      message: `Deleted All unconfirmed that were created ${BOOKING_DEADLINE} days ago`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error});
  }
};
