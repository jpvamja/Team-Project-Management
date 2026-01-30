import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key) => {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const requireNumber = (key, fallback) => {
    const value = process.env[key];
    if (value === undefined) {return fallback;}

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a number`);
    }
    return parsed;
};

const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: requireNumber("PORT", 5000),
    MONGO_URI: requireEnv("MONGO_URI"),
});

export default env;
