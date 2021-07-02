import Joi from "joi";

const updateUserSchema = data => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(40).pattern(/^[A-Za-zÀ-úç'\s]+$/).required(),
    email: Joi.string().trim().email().required(),
    picture: Joi.string().trim().uri().allow('', null)
  });
  return schema.validate(data);
}

export default updateUserSchema;