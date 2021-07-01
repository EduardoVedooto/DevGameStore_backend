import Joi from "joi";

const messageSchema = data => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required(),
        subject: Joi.string().trim().min(3).max(40).pattern(/^[A-Za-zÀ-úç'\s]+$/).required(),
        message: Joi.string().trim().min(3).max(300).pattern(/^[A-Za-zÀ-úç'\s]+$/).required()
    });
    return schema.validate(data);
    }

export default messageSchema;