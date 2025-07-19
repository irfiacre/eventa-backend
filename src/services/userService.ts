import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

type Role = 'admin' | 'customer';

export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}) => {
  return prisma.user.create({
    data: {
      ...data,
      role: data.role || 'customer',
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
}; 