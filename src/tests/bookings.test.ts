import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Booking Endpoints', () => {
  let eventId: string;
  let bookingId: string;
  const testUser = {
    firstName: 'Book',
    lastName: 'Customer',
    email: 'bookcustomer@example.com',
    password: 'bookpass123',
  };
  let userToken: string;
  const testEvent = {
    title: 'Bookable Event',
    description: 'Event for booking',
    location: 'Book City',
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    capacity: 10,
    price: 20,
    userId: '', // will set after creating admin
  };
  const adminUser = {
    firstName: 'BookAdmin',
    lastName: 'Admin',
    email: 'bookadmin@example.com',
    password: 'adminpass123',
    role: 'admin',
  };
  let adminToken: string;

  beforeAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: [testUser.email, adminUser.email] } } });
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
    // Register customer
    await request(app).post('/auth/register').send(testUser);
    const userLoginRes = await request(app).post('/auth/login').send({ email: testUser.email, password: testUser.password });
    userToken = userLoginRes.body.token;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: [testUser.email, adminUser.email] } } });
    await prisma.$disconnect();
  });

  it('should allow a customer to book an event', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ eventId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    bookingId = res.body.id;
  });

  it('should list my bookings', async () => {
    const res = await request(app)
      .get('/bookings')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should allow a customer to cancel a booking', async () => {
    const res = await request(app)
      .put(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Booking cancelled successfully');
  });
});
