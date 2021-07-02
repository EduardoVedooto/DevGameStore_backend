import supertest from 'supertest';
import app from '../src/App.js';
import connection from '../src/database/Database.js';
import database from '../src/database/Database.js';
import { SignUp, ValidBody, SignIn, PaymentValid } from './utils.js';

beforeEach(async () => {
  await connection.query(`DELETE FROM users`);
  await connection.query('DELETE FROM sessions')
});

afterAll(async () => {
  database.end();
});

describe("POST /Cart", () => {

  it("should returns status 400 when id is empty", async () => {
    const response = await supertest(app).post("/cart").send({});
    expect(response.status).toEqual(400);
  });

  it("should returns status 400 when id is empty", async () => {
    const response = await supertest(app).post("/cart").send({});
    expect(response.status).toEqual(400);
  });

  it("should returns status 206 when at least one id is valid", async () => {
    const response = await supertest(app).post("/cart").send({ "ids": [1, 50] });
    expect(response.status).toEqual(206);
  });

  it("should returns status 404 when all ids are invalid", async () => {
    const response = await supertest(app).post("/cart").send({ "ids": [49, 50] });
    expect(response.status).toEqual(404);
  });

  it("should returns status 200 when all ids are valid", async () => {
    const response = await supertest(app).post("/cart").send({ "ids": [1, 2] });
    expect(response.status).toEqual(200);
  });

});