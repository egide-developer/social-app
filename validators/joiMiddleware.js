// validators/joiMiddleware.js
export function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const details = error.details.map(d => ({ message: d.message, path: d.path }));
            return res.status(400).json({ message: "Validation error", details });
        }
        req.validated = value;
        next();
    };
}
