import Joi from "joi";

const cardSchema = data => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(40).pattern(/^[A-Za-zÀ-úç'\s]+$/).required(),
    number: Joi.string().pattern(/^[0-9]{16}$/).required(),
    cvv: Joi.string().pattern(/^[0-9]{3,4}$/).required(),
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(2021).max(2039).required()
  });
  return schema.validate(data);
}

export default cardSchema;
