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
    thumbnail: 'https://example.com/event.jpg',
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
      .send(testEvent);
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

  describe('POST /bookings', () => {
    it('should allow a customer to book an event', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('eventId', eventId);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('status', 'pending');
      bookingId = res.body.id;
    });

    it('should reject booking without authentication', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({ eventId });
      expect(res.status).toBe(401);
    });

    it('should reject booking with invalid event ID', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: 'invalid-id' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject booking for non-existent event', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: '00000000-0000-0000-0000-000000000000' });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });

    it('should reject duplicate booking for same event', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Already booked this event');
    });

    it('should validate booking input', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /bookings', () => {
    it('should list my bookings', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return bookings with event details', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      const booking = res.body[0];
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('eventId');
      expect(booking).toHaveProperty('userId');
      expect(booking).toHaveProperty('status');
      expect(booking).toHaveProperty('event');
      expect(booking.event).toHaveProperty('title');
      expect(booking.event).toHaveProperty('description');
      expect(booking.event).toHaveProperty('location');
      expect(booking.event).toHaveProperty('date');
      expect(booking.event).toHaveProperty('price');
    });

    it('should reject access without authentication', async () => {
      const res = await request(app)
        .get('/bookings');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /bookings/:id', () => {
    it('should allow a customer to cancel their booking', async () => {
      const res = await request(app)
        .put(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Booking cancelled successfully');
    });

    it('should reject cancellation without authentication', async () => {
      const res = await request(app)
        .put(`/bookings/${bookingId}`);
      expect(res.status).toBe(401);
    });

    it('should reject cancellation of non-existent booking', async () => {
      const res = await request(app)
        .put('/bookings/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Booking not found');
    });

    it('should reject cancellation of another user\'s booking', async () => {
      const anotherUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'anotheruser@example.com',
        password: 'password123',
      };
      await request(app).post('/auth/register').send(anotherUser);
      const anotherUserLogin = await request(app).post('/auth/login').send({ email: anotherUser.email, password: anotherUser.password });
      const anotherUserToken = anotherUserLogin.body.token;
      
      const anotherBooking = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ eventId });
      
      const res = await request(app)
        .put(`/bookings/${anotherBooking.body.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Not authorized to cancel this booking');
    });
  });

  describe('Capacity and Business Logic', () => {
    it('should reject booking when event is at capacity', async () => {
      const smallEvent = {
        ...testEvent,
        title: 'Small Capacity Event',
        capacity: 1,
        date: new Date(Date.now() + 172800000).toISOString(),
      };
      
      const eventRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(smallEvent);
      const smallEventId = eventRes.body.id;

      await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: smallEventId });
      
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: smallEventId });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Event is full');
    });

    it('should reject booking for past events', async () => {
      const pastEvent = {
        ...testEvent,
        title: 'Past Event',
        date: new Date(Date.now() - 86400000).toISOString(),
      };
      
      const eventRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pastEvent);
      
      const pastEventId = eventRes.body.id;
      
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ eventId: pastEventId });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cannot book past events');
    });
  });
});
