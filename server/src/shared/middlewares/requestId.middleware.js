import crypto from "crypto";

const REQUEST_ID_HEADER = "x-request-id";

const requestIdMiddleware = (req, res, next) => {
    const incomingId =
        req.headers[REQUEST_ID_HEADER] || req.headers[REQUEST_ID_HEADER.toLowerCase()];

    const requestId = incomingId || crypto.randomUUID();

    req.requestId = requestId;
    res.locals.requestId = requestId;

    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
};

export default requestIdMiddleware;
