import ApiError from "../../shared/errors/ApiError.js";

const notFoundMiddleware = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export default notFoundMiddleware;
