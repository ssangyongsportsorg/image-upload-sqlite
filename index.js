import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { initDatabase } from './db/index.js';
import uploadRoutes from './routes/upload.js';
import { errorHandler } from './utils/errorHandler.js';
import { setupExpirationJob } from './utils/expirationHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize database
await initDatabase();

// Set up scheduled job for handling expired images
setupExpirationJob();

// Middleware
app.use(cors());
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ extended: true, limit: '32mb' }));

// Routes
app.use('/1', uploadRoutes);

// Main route
app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'Image Gallery API is running',
    endpoints: {
      upload: '/1/upload'
    }
  });
});

// Error handler middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
