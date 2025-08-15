import type { NextFunction } from "express";
import { ValidationError } from "express-validator";
import { Request, Response } from "express";
export declare function reqErrorFormatter(error: ValidationError): string;
export declare function errorHandler(error: unknown, res: Response): void;
export declare function validateRequest(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=general.d.ts.map