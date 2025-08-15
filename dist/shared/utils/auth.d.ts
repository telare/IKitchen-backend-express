import jwt from "jsonwebtoken";
import { Response } from "express";
export declare const authReqBodyRules: {
    name: import("express-validator").ValidationChain;
    email: import("express-validator").ValidationChain;
    password: import("express-validator").ValidationChain;
};
export declare function signUpValidationRules(): import("express-validator").ValidationChain[];
export declare function logInValidationRules(): import("express-validator").ValidationChain[];
export declare function generateJWTtokens(payload: string | object, secretKey: jwt.Secret): {
    accessToken: string;
    refreshToken: string;
};
export declare function setAuthCookies(res: Response, tokens: {
    accessToken: string;
    refreshToken: string;
}): void;
//# sourceMappingURL=auth.d.ts.map