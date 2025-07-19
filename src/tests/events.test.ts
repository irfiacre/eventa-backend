import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Event Endpoints', () => {
  let eventId: string;
  const testEvent = {
    title: 'Test Event',
    description: 'A test event',
    location: 'Test City',
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    capacity: 100,
    price: 10,
    userId: '', // will set after creating admin
  };
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'adminuser@example.com',
    password: 'adminpass123',
    role: 'admin',
  };
  let adminToken: string;

  beforeAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    // Register admin
    await request(app).post('/auth/register').send(adminUser);
    const loginRes = await request(app).post('/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginRes.body.token;
    // Create event as admin
    const eventRes = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...testEvent, userId: undefined });
    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    await prisma.$disconnect();
  });

  it('should list all upcoming events', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get event details by id', async () => {
    const res = await request(app).get(`/events/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', eventId);
  });
}); 