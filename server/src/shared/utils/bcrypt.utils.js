import bcrypt from "bcrypt";
import { env } from "../../configs/index.js";
import ApiError from "../errors/ApiError.js";

const SALT_ROUNDS = Number(env.BCRYPT_SALT_ROUNDS) || 10;

export const hashPassword = async (password) => {
    if (!password) {
        throw ApiError.badRequest("Password is required for hashing");
    }

    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        throw ApiError.unauthorized("Invalid credentials");
    }

    return bcrypt.compare(password, hashedPassword);
};
