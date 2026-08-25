import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { prisma } from "./lib/prisma.js";
import { asyncHandler } from "./utils/asyncHandler.js";

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.get(
  "/db-health",
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
    });
  }),
);
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
