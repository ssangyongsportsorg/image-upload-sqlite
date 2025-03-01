import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import { client } from '../db/index.js';

export async function uploadImage(req, res, next) {
  try {
    let imageBuffer, imageType, imageName, imageExt;
    const expiration = req.query.expiration || req.body.expiration || 0;
    
    // Validate expiration time (60-15552000 seconds or 0 for no expiration)
    if (expiration !== 0 && (expiration < 60 || expiration > 15552000)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Expiration must be between 60 and 15552000 seconds, or 0 for no expiration",
          code: 400
        }
      });
    }
    
    // Extract image from request
    if (req.file) {
      // Case 1: File upload via multipart/form-data
      imageBuffer = req.file.buffer;
      imageName = req.body.name || req.file.originalname || 'unnamed';
    } else if (req.body.image) {
      // Case 2: Base64 data or URL
      const imageData = req.body.image;
      
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        // Case 2a: URL
        try {
          const response = await axios.get(imageData, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
          
          // Try to get filename from URL
          const urlParts = new URL(imageData).pathname.split('/');
          imageName = req.body.name || urlParts[urlParts.length - 1] || 'unnamed';
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: {
              message: "Failed to fetch image from URL",
              code: 400
            }
          });
        }
      } else {
        // Case 2b: Base64 data
        try {
          // Check if it's a data URL or pure base64
          if (imageData.includes('base64,')) {
            const base64Data = imageData.split('base64,')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
          } else {
            imageBuffer = Buffer.from(imageData, 'base64');
          }
          
          imageName = req.body.name || 'unnamed';
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: {
              message: "Invalid base64 data",
              code: 400
            }
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        error: {
          message: "No image provided",
          code: 400
        }
      });
    }
    
    // Validate image data
    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid image data",
          code: 400
        }
      });
    }
    
    // Get file type from buffer
    const fileType = await fileTypeFromBuffer(imageBuffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Uploaded file is not a valid image",
          code: 400
        }
      });
    }
    
    imageType = fileType.mime;
    imageExt = fileType.ext;
    
    // Process image with Sharp
    const metadata = await sharp(imageBuffer).metadata();
    
    // Generate unique ID for image
    const imageId = generateShortId();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Format the image name and filename properly
    const nameWithoutExt = imageName.includes('.') 
      ? imageName.substring(0, imageName.lastIndexOf('.')) 
      : imageName;
    
    // Generate final filename
    const filename = `${nameWithoutExt}.${imageExt}`;
    
    // Create URLs
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/images/${imageId}`;
    const displayUrl = imageUrl; // For this implementation they're the same
    const viewerUrl = `${baseUrl}/view/${imageId}`;
    
    // Save image to database
    await client.execute({
      sql: `INSERT INTO images (
        id, title, filename, name, mime, extension, 
        width, height, size, time, expiration, data, url, 
        display_url, delete_url, api_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        imageId, 
        nameWithoutExt, 
        filename, 
        nameWithoutExt, 
        imageType, 
        imageExt,
        metadata.width, 
        metadata.height, 
        imageBuffer.length, 
        timestamp, 
        expiration,
        imageBuffer, 
        imageUrl, 
        displayUrl,
        `${baseUrl}/delete/${imageId}?key=${req.apiKey}`, 
        req.apiKey
      ]
    });
    
    // Send response in the same format as the example
    res.json({
      data: {
        id: imageId,
        title: nameWithoutExt,
        url_viewer: viewerUrl,
        url: imageUrl,
        display_url: displayUrl,
        width: metadata.width,
        height: metadata.height,
        size: imageBuffer.length,
        time: timestamp.toString(),
        expiration: expiration.toString(),
        image: {
          filename: filename,
          name: nameWithoutExt,
          mime: imageType,
          extension: imageExt,
          url: imageUrl,
        },
        thumb: {
          filename: filename,
          name: nameWithoutExt,
          mime: imageType,
          extension: imageExt,
          url: imageUrl,
        },
        delete_url: `${baseUrl}/delete/${imageId}?key=${req.apiKey}`
      },
      success: true,
      status: 200
    });
    
  } catch (error) {
    next(error);
  }
}

// Generate a short ID similar to imgBB (7 characters)
function generateShortId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
