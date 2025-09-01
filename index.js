import http from "http";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Health check log
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Closing server...`);
  server.close(() => {
    logger.info("Server closed gracefully.");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Force exiting after timeout");
    process.exit(1);
  }, 10000);
};

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
