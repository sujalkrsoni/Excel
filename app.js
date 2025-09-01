import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import fileRoutes from "./routes/file.routes.js";
import { errorHandler } from "./middlewares/error.handler.js";
import requestLogger from "./middlewares/request.logger.js";

const app = express(); 

// Core middlewares
app.use(helmet());
app.use(express.json({ limit: "2mb" }));

// Logging
app.use(morgan("combined"));
app.use(requestLogger);

// Health checker
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api", fileRoutes);

// Error handler (last)
app.use(errorHandler);

export default app;
