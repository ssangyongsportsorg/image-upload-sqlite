import express from 'express';
import { getImage, deleteImage } from '../controllers/imageController.js';
import { validateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Get image by ID
router.get('/images/:id', getImage);

// View image page
router.get('/view/:id', async (req, res) => {
  res.send(`<html><body><img src="/images/${req.params.id}" /></body></html>`);
});

// Delete image by ID (requires API key)
router.get('/delete/:id', validateApiKey, deleteImage);

export default router;
