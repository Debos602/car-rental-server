import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../config';
import catchAsync from '../utils/catcgAsync';

const auth = (requiredRole: string) => {
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

    console.log('Token:', token);

    // Verify the token-
    const decoded = jwt.verify(
      token,
      config.jwt_access_token_secret as string,
    ) as jwt.JwtPayload;

    console.log('Decoded:', decoded);
    if (decoded.role !== requiredRole) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden');
    }

    // Optionally attach user information to request
    req.user = { _id: decoded.userId, role: decoded.role }; // Set user based on decoded token

    // Proceed to the next middleware or route handler
    next();
  });
};

export default auth;
