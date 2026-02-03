const asyncHandler = (handler) => {
    if (typeof handler !== "function") {
        throw new TypeError("asyncHandler expects a function");
    }

    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
