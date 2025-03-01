import dotenv from 'dotenv';

dotenv.config();

const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

export function validateApiKey(req, res, next) {
  const apiKey = req.query.key || req.body.key;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Missing API key",
        code: 401
      }
    });
  }
  
  if (!API_KEYS.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      error: {
        message: "Invalid API key",
        code: 403
      }
    });
  }
  
  req.apiKey = apiKey;
  next();
}
