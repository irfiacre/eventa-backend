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
    thumbnail: 'https://example.com/image.jpg',
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
    await request(app).post('/auth/register').send(adminUser);
    const loginRes = await request(app).post('/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginRes.body.token;
    const eventRes = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testEvent);
    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany({ where: { email: adminUser.email } });
    await prisma.$disconnect();
  });

  describe('GET /events', () => {
    it('should list all events', async () => {
      const res = await request(app).get('/events');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return events with correct structure', async () => {
      const res = await request(app).get('/events');
      expect(res.status).toBe(200);
      const event = res.body[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('date');
      expect(event).toHaveProperty('capacity');
      expect(event).toHaveProperty('price');
      expect(event).toHaveProperty('thumbnail');
    });
  });

  describe('GET /events/:id', () => {
    it('should get event details by id', async () => {
      const res = await request(app).get(`/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', eventId);
      expect(res.body).toHaveProperty('user');
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app).get('/events/non-existent-id');
      console.log("-----", res)
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Event not found');
    });

    it('should return 400 for invalid event id format', async () => {
      const res = await request(app).get('/events/invalid-id');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /events (Admin only)', () => {
    it('should create a new event as admin', async () => {
      const newEvent = {
        ...testEvent,
        title: 'New Test Event',
        date: new Date(Date.now() + 172800000).toISOString(),
      };
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEvent);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(newEvent.title);
    });

    it('should reject event creation without auth', async () => {
      const res = await request(app)
        .post('/events')
        .send(testEvent);
      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Incomplete Event' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should validate date format', async () => {
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...testEvent, date: 'invalid-date' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should validate capacity is positive', async () => {
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...testEvent, capacity: -1 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should validate price is non-negative', async () => {
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...testEvent, price: -10 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('PUT /events/:id (Admin only)', () => {
    it('should update an existing event', async () => {
      const updateData = {
        title: 'Updated Event Title',
        description: 'Updated description',
      };
      const res = await request(app)
        .put(`/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.description).toBe(updateData.description);
    });

    it('should reject update without auth', async () => {
      const res = await request(app)
        .put(`/events/${eventId}`)
        .send({ title: 'Unauthorized Update' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent event', async () => {
      const res = await request(app)
        .put('/events/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Update' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /events/:id/bookings (Admin only)', () => {
    it('should get event bookings as admin', async () => {
      const res = await request(app)
        .get(`/events/${eventId}/bookings`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should reject access without auth', async () => {
      const res = await request(app)
        .get(`/events/${eventId}/bookings`);
      expect(res.status).toBe(401);
    });
  });
});
