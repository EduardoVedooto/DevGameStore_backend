import supertest from "supertest";
import app from "../src/App";

export const SignUp = async () => {
  await supertest(app).post("/sign-up").send(ValidBody);
}

export const SignIn = async () => {
  const user = await supertest(app).post("/sign-in").send({ email: ValidBody.email, password: ValidBody.password });
  return user.body;
}

export const ValidBody = {
  name: "Teste",
  email: "teste@email.com",
  password: "123456",
  confirmPassword: "123456"
}

export const PaymentValid = {
  "card": {
    "name": "teste",
    "number": "1234567821234567",
    "cvv": "1234",
    "month": "12",
    "year": "2021"
  },
  "games": [
    {
      "price": 12000,
      "id": 1
    },
    {
      "price": 32000,
      "id": 23
    }
  ],
  "total": 10000
}

export const UserValid = {
  name: "teste",
  email: "teste@teste.com",
  picture: ""
}