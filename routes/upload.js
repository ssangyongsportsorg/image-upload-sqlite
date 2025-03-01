import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { validateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 32 * 1024 * 1024 } // 32 MB limit
});

// Handle image upload - supports multipart/form-data, base64 or URL
router.post('/upload', validateApiKey, upload.single('image'), uploadImage);

export default router;
