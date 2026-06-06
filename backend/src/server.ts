import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import logRoutes from './routes/logRoutes';
import videoRoutes from './routes/videoRoutes';
import chatRoutes from './routes/chatRoutes';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is defined to prevent Prisma schema validation errors
const isDbConfigured = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder');
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:placeholder@localhost:5432/postgres?schema=public';
}

const app = express();
const PORT = process.env.PORT || 5000;

export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Kannada Seva school analytics API is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start the server
async function main() {
  if (isDbConfigured) {
    try {
      await prisma.$connect();
      console.log('Successfully connected to the database.');
    } catch (error) {
      console.warn('Database connection failed, falling back to mock database mode:', error);
    }
  } else {
    console.log('Running in MOCK/OFFLINE database mode (DATABASE_URL not configured).');
  }

  function startServer(port: number) {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (err: any) => {
      if (err && err.code === 'EADDRINUSE') {
        const fallbackPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying port ${fallbackPort} instead...`);
        startServer(fallbackPort);
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    });
  }

  startServer(Number(PORT));
}

main();
