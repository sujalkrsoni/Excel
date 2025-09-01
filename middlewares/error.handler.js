import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
