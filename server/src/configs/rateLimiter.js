const rateLimits = Object.freeze({
    GLOBAL: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
    AUTH: {
        windowMs: 10 * 60 * 1000,
        max: 5,
    },
    OTP: {
        windowMs: 10 * 60 * 1000,
        max: 3,
    },
});

export default rateLimits;
