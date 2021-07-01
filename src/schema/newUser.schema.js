import Joi from "joi";

const userSchema = data => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(40).pattern(/^[A-Za-zÀ-úç'\s]+$/).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required(),
    confirmPassword: Joi.ref('password'),
    picture: Joi.string().trim().uri().allow('', null)
  });
  return schema.validate(data);
}

export default userSchema;

