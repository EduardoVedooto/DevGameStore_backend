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

describe("POST /Checkout", () => {

  it("should returns status 401 when token is empty", async () => {
    const response = await supertest(app).post("/checkout").send(PaymentValid).set("Authorization", "").query({ "type": "cre" });
    expect(response.status).toEqual(401);
  });

  it("should returns status 404 when token is invalid", async () => {
    const response = await supertest(app).post("/checkout").send(PaymentValid).set("Authorization", "427348927").query({ "type": "cre" });
    expect(response.status).toEqual(404);
  });

  it("should returns status 400 when type is invalid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).post("/checkout").send(PaymentValid).set("Authorization", "Bearer " + user.token).query({ "type": "" });
    expect(response.status).toEqual(400);
  });

  it("should returns status 400 when name of card is invalid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).post("/checkout").send({ ...PaymentValid, card: { ...PaymentValid.card, name: "" } }).set("Authorization", "Bearer " + user.token).query({ "type": "cre" });
    expect(response.status).toEqual(400);
  });

  it("should returns status 400 when games id is invalid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).post("/checkout").send({ ...PaymentValid, games: [] }).set("Authorization", "Bearer " + user.token).query({ "type": "cre" });
    expect(response.status).toEqual(400);
  });

  it("should returns status 200 when all entries are valid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).post("/checkout").send(PaymentValid).set("Authorization", "Bearer " + user.token).query({ "type": "cre" });
    expect(response.status).toEqual(200);
  });

});