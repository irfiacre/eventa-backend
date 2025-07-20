import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (data: {
  eventId: string;
  userId: string;
}) => {
  return prisma.booking.create({ data });
};

export const getUserBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getBookingById = async (id: string) => {
  return prisma.booking.findUnique({ where: { id } });
};

export const updateBooking = async (id: string, data: any) => {
  return prisma.booking.update({ where: { id }, data });
};

export const deleteBooking = async (id: string) => {
  return prisma.booking.delete({ where: { id } });
};

export const checkExistingBooking = async (eventId: string, userId: string) => {
  return prisma.booking.findFirst({
    where: {
      eventId,
      userId,
    },
  });
};

export const getEventBookingCount = async (eventId: string) => {
  return prisma.booking.count({
    where: { eventId },
  });
};
