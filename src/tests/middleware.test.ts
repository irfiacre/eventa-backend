import request from 'supertest';
import app from '../app';
import { signJwt } from '../utils/jwt';

describe('Authentication Middleware', () => {
  const validPayload = { id: 'test-user-id', role: 'customer' };
  const adminPayload = { id: 'admin-user-id', role: 'admin' };

  describe('Valid Authentication', () => {
    it('should allow access with valid JWT token', async () => {
      const token = signJwt(validPayload);
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).not.toBe(401);
    });

    it('should allow admin access with valid admin token', async () => {
      const token = signJwt(adminPayload);
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Event',
          description: 'Test Description',
          location: 'Test Location',
          date: new Date(Date.now() + 86400000).toISOString(),
          capacity: 100,
          price: 10,
          thumbnail: 'https://example.com/image.jpg',
        });
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  });

  describe('Invalid Authentication', () => {
    it('should reject request without Authorization header', async () => {
      const res = await request(app)
        .get('/bookings');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('should reject request with invalid Authorization format', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', 'InvalidFormat token123');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('should reject request with invalid JWT token', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });

    it('should reject request with malformed token', async () => {
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', 'Bearer not.a.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });

  describe('Authorization Middleware', () => {
    it('should allow customer access to customer endpoints', async () => {
      const token = signJwt(validPayload);
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${token}`);
        expect(res.status).not.toBe(403);
    });

    it('should reject customer access to admin endpoints', async () => {
      const token = signJwt(validPayload);
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Event',
          description: 'Test Description',
          location: 'Test Location',
          date: new Date(Date.now() + 86400000).toISOString(),
          capacity: 100,
          price: 10,
          thumbnail: 'https://example.com/image.jpg',
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Insufficient permissions');
    });

    it('should allow admin access to admin endpoints', async () => {
      const token = signJwt(adminPayload);
      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Event',
          description: 'Test Description',
          location: 'Test Location',
          date: new Date(Date.now() + 86400000).toISOString(),
          capacity: 100,
          price: 10,
          thumbnail: 'https://example.com/image.jpg',
        });
      expect(res.status).not.toBe(403);
    });

    it('should reject admin access to customer endpoints', async () => {
      const token = signJwt(adminPayload);
      const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Insufficient permissions');
    });
  });

  describe('Public Endpoints', () => {
    it('should allow access to public endpoints without authentication', async () => {
      const res = await request(app)
        .get('/events');
      expect(res.status).toBe(200);
    });

    it('should allow access to public endpoints with authentication', async () => {
      const token = signJwt(validPayload);
      const res = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
}); 