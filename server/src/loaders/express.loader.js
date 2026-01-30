import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import routes from "../routes/index.routes.js";
import { env } from "../configs/index.js";
import { globalRateLimiter } from "../shared/middlewares/rateLimit.middleware.js";
import requestIdMiddleware from "../shared/middlewares/requestId.middleware.js";
import notFoundMiddleware from "../shared/middlewares/notFound.middleware.js";
import errorMiddleware from "../shared/middlewares/error.middleware.js";

const expressLoader = (app) => {
    app.set("trust proxy", 1);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cookieParser());

    app.use(helmet());

    app.use(
        cors({
            origin: env.NODE_ENV === "production" ? ["https://frontend.com"] : "*",
            credentials: env.NODE_ENV === "production",
        })
    );

    app.use(globalRateLimiter);

    app.use(requestIdMiddleware);

    app.use("/api/v1", routes);

    app.use(notFoundMiddleware);

    app.use(errorMiddleware);
};

export default expressLoader;
