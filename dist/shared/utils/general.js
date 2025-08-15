import { validationResult, } from "express-validator";
export function reqErrorFormatter(error) {
    let result = "";
    if (error.type === "field") {
        const { location, msg, path } = error;
        result = `${msg}: '${path}' in ${location}`;
    }
    return result;
}
export function errorHandler(error, res) {
    if (error instanceof Error) {
        console.log(error);
        res.status(500).json({
            message: `An unexpected error happened, try again later. Error: ${error.message}.`,
        });
    }
}
export function validateRequest(req, res, next) {
    const errors = validationResult(req).formatWith(reqErrorFormatter);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
//# sourceMappingURL=general.js.map