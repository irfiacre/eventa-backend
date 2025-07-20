import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  capacity: z.number().positive('Capacity must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
  thumbnail: z.string().min(1, 'Date is required'),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  date: z.string().min(1, 'Date is required').optional(),
  capacity: z.number().positive('Capacity must be positive').optional(),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  thumbnail: z.string().optional(),
}); 
