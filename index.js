import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initDatabase } from './db.js';
import uploadRoutes from './routes/upload.js';
import imageRoutes from './routes/images.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupExpirationJob } from './services/expirationHandler.js';

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
app.use('/', imageRoutes);

// Main route
app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: '這是雙龍體育儲存圖片的地方，有任何問題請聯繫：support@ssangyongsports.eu.org',
    endpoints: {
      image: '/images/:id'
    }
  });
});

// Error handler middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
