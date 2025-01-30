import { NextFunction, Request, Response } from 'express';

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

/**
 * A Higher Order Function that takes an async controller and return the original controller.
 * It  wraps the passed controller with a try-catch block and minimizes code with regards to error handling.
 * @param {Function} controller async(req, res, next) => {}
 * @returns {Function} async(req, res, next) => {}
 */
const catchErrors =
  (controller: AsyncController): AsyncController =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchErrors;
