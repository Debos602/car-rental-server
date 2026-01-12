import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure any thrown/rejected error is forwarded to next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
