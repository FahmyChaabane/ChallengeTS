import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/httpException";

export const asyncHandler =
  (handler: Function) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new HttpException(400, errors.array()[0].msg);
      }
      await handler(req, res);
    } catch (error: any) {
      next(new HttpException(error.status, error.message));
    }
  };
