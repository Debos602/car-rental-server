import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../config';
import catchAsync from '../utils/catcgAsync';

// Allow callers to pass a single role string, an array of allowed roles, or omit to only require authentication
const auth = (requiredRole?: string | string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // Ensure the Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Authorization header missing or incorrect',
      );
    }

    // Extract the token by removing the "Bearer " prefix
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(
      token,
      config.jwt_access_token_secret as string,
    ) as jwt.JwtPayload;

    // Attach user info
    req.user = { _id: decoded.userId, role: decoded.role };

    // If a role is required, validate it. Support string or array of roles.
    if (requiredRole) {
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(decoded.role)) {
          throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden');
        }
      } else {
        if (decoded.role !== requiredRole) {
          throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden');
        }
      }
    }

    // Proceed to the next middleware or route handler
    next();
  });
};

export default auth;
