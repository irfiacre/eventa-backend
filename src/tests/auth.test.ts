import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(testUser.email);
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    expect(res.status).toBe(409);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
}); 