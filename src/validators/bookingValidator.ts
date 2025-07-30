import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  number: z.number().nonnegative('Number must be 1'),
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const deadlineSchema = z.object({
  days: z.number('Days should a number (ex: 2 days ago)'),
});
