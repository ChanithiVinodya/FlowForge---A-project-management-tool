import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

type Target = 'body' | 'query' | 'params';

// Usage: validate(registerSchema) or validate(paramsSchema, 'params')
// On success, req[target] is REPLACED with the parsed (and type-coerced) data.
export const validate =
  (schema: ZodTypeAny | AnyZodObject, target: Target = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.badRequest('Validation failed', err.flatten().fieldErrors));
      }
      next(err);
    }
  };
