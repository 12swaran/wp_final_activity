import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponsePayload['meta']
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (
  res: Response,
  error: string | any = 'An error occurred',
  statusCode: number = 500,
  message: string = 'Error'
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: typeof error === 'string' ? error : error.message || error,
  });
};
