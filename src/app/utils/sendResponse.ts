import { Response } from 'express';

interface ResponseData<T> {
  statusCode: number;
  message: string;
  token?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

const sendResponse = <T>(res: Response, responseData: ResponseData<T>) => {
  const { statusCode, message, token, data, meta } = responseData;

  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 400,
    statusCode,
    message,
    token,
    data,
    meta,
  });
};

export default sendResponse;
