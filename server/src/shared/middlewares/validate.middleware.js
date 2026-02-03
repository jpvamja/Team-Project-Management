import ApiError from "../errors/ApiError.js";

const validatorMiddleware = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            cookies: req.cookies,
        });

        if (!result.success) {
            const formattedErrors = result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return next(ApiError.badRequest("Validation failed", formattedErrors));
        }

        Object.assign(req, result.data);
        next();
    };
};

export default validatorMiddleware;
