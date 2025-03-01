export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      code: statusCode
    }
  });
}
