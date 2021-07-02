import supertest from 'supertest';
import app from '../src/App.js';
import connection from '../src/database/Database.js';
import database from '../src/database/Database.js';
import { SignIn, SignUp, ValidBody, PaymentValid, UserValid } from "./utils.js";

beforeEach(async () => {
  await connection.query(`DELETE FROM users`);
  await connection.query('DELETE FROM sessions')
});

afterAll(async () => {
  database.end();
});

describe("POST /update", () => {

  it("should returns status 401 when token is missing", async () => {
    const response = await supertest(app).put("/update-user").send(UserValid).set("Authorization", "");
    expect(response.status).toEqual(401);
  });

  it("should returns status 401 when token is invalid", async () => {
    const response = await supertest(app).put("/update-user").send(UserValid).set("Authorization", "Bearer udahdjka");
    expect(response.status).toEqual(404);
  });

  it("should returns status 400 when one item from body is invalid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).put("/update-user").send({ ...UserValid, name: "" }).set("Authorization", "Bearer " + user.token);
    expect(response.status).toEqual(400);
  });

  it("should returns status 200 when is all valid", async () => {
    await SignUp();
    const user = await SignIn();
    const response = await supertest(app).put("/update-user").send(UserValid).set("Authorization", "Bearer " + user.token);
    expect(response.status).toEqual(200);
  });

});