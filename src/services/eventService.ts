import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createEvent = async (data: {
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  price: number;
  userId: string;
  thumbnail: string;
}) => {
  return prisma.event.create({ data });
};

export const getAllEvents = async () => {
  return prisma.event.findMany({
    orderBy: { date: "desc" },
  });
};

export const getEventById = async (id: string) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const updateEvent = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    date?: Date;
    capacity?: number;
    price?: number;
    thumbnail?: string;
  }
) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

export const deleteAnEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};

export const getEventBookings = async (eventId: string) => {
  return prisma.booking.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};
