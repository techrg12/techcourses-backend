const ErrorMiddleware = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  resp.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.statusCode,
  });
};

export default ErrorMiddleware;
