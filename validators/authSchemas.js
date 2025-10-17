// validators/authSchemas.js
import Joi from "joi";

const profileSchema = Joi.object({
    bio: Joi.string().allow("").max(500),
    image: Joi.string().uri().allow("image.png").default("image.png"),
    links: Joi.array().items(Joi.string().uri()).default([]),
}).default();

export const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    firstname: Joi.string().max(100).required(),
    lastname: Joi.string().max(100).required(),
    password: Joi.string().min(8).max(128).required(),
    dob: Joi.date().optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    profile: profileSchema.optional(),
});

export const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
});

export const sendCodeSchema = Joi.object({
    email: Joi.string().email().required(),
    type: Joi.string().valid("verify-email", "reset-password", "2fa").default("verify-email"),
});

export const verifyCodeSchema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().required(),
    type: Joi.string().valid("verify-email", "reset-password", "2fa").default("verify-email"),
});

export const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
});
