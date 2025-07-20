import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
