import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../configs/index.js";
import { TOKEN_TYPES } from "../../modules/auth/auth.constants.js";

export const signAccessToken = (payload) => {
    if (!env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is missing");
    }
    return jwt.sign({ ...payload, tokenType: TOKEN_TYPES.ACCESS }, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
};

export const signRefreshToken = (payload) => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing");
  }

  return jwt.sign(
    {
      ...payload,
      tokenType: TOKEN_TYPES.REFRESH,
      jti: crypto.randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

export const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (decoded.tokenType !== TOKEN_TYPES.ACCESS) {
        throw new Error("Invalid token type");
    }

    return decoded;
};

export const verifyRefreshToken = (token) => {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

    if (decoded.tokenType !== TOKEN_TYPES.REFRESH) {
        throw new Error("Invalid token type");
    }

    return decoded;
};

export const getRefreshTokenExpiryDate = () => {
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
    const value = parseInt(expiresIn, 10);

    if (expiresIn.endsWith("d")) {
        return new Date(Date.now() + value * 24 * 60 * 60 * 1000);
    }

    if (expiresIn.endsWith("h")) {
        return new Date(Date.now() + value * 60 * 60 * 1000);
    }

    if (expiresIn.endsWith("m")) {
        return new Date(Date.now() + value * 60 * 1000);
    }

    return new Date(Date.now() + value * 1000);
};
