import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import swaggerSpec from './config/swagger';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger setup (basic, will update with full docs later)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// TODO: Add routes here
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);

export default app;
