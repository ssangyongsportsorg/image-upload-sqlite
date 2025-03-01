import { client } from '../db/index.js';

// Get image by ID
export async function getImage(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get image from database
    const result = await client.execute({
      sql: `SELECT data, mime FROM images WHERE id = ?`,
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Image not found",
          code: 404
        }
      });
    }
    
    // Send image data
    res.setHeader('Content-Type', result.rows[0].mime);
    res.send(Buffer.from(result.rows[0].data));
    
  } catch (error) {
    next(error);
  }
}

// Delete image by ID
export async function deleteImage(req, res, next) {
  try {
    const { id } = req.params;
    const apiKey = req.apiKey;
    
    // Check if image exists and belongs to the API key
    const result = await client.execute({
      sql: `SELECT id FROM images WHERE id = ? AND api_key = ?`,
      args: [id, apiKey]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Image not found or you don't have permission to delete it",
          code: 404
        }
      });
    }
    
    // Delete image
    await client.execute({
      sql: `DELETE FROM images WHERE id = ?`,
      args: [id]
    });
    
    res.json({
      success: true,
      status: 200,
      message: "Image deleted successfully"
    });
    
  } catch (error) {
    next(error);
  }
}
