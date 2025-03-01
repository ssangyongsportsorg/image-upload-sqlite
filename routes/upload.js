import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { validateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
});

// Handle image upload - supports multipart/form-data, base64 or URL
router.post('/upload', validateApiKey, upload.single('image'), uploadImage);

export default router;
