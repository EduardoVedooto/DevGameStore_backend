import supertest from 'supertest';
import app from '../src/App.js';
import connection from '../src/database/Database.js';
import database from '../src/database/Database.js';

beforeEach(async () => {
  await connection.query(`DELETE FROM users`);
  await connection.query('DELETE FROM sessions')
});

afterAll(async () => {
  database.end();
});

describe("POST /sign-in", () => {

  it("returns status 200 for valid credentials", async () => {
    const body = {
      "name": "gamestore",
      "email": "gamestore@gmail.com",
      "password": "gamestorepassword"
    }
    const login = {
      "email": "gamestore@gmail.com",
      "password": "gamestorepassword"
    }
    const test = await supertest(app).post("/sign-up").send(body);
    expect(test.status).toEqual(201);
    const exists = await supertest(app).post("/sign-in").send(login);
    expect(exists.status).toEqual(200);
  });

  it("returns status 401 for unregistered email", async () => {
    const body = {
      "email": "gamestore@gmail.com",
      "password": "gamestorepassword"
    }
    const test = await supertest(app).post("/sign-in").send(body);
    expect(test.status).toEqual(401);
  });

  it("returns status 401 for wrong password", async () => {
    const body = {
      "name": "gamestore",
      "email": "gamestore@gmail.com",
      "password": "gamestorepassword"
    }
    const login = {
      "email": "gamestore@gmail.com",
      "password": "gamestorepassword2"
    }
    const test = await supertest(app).post("/sign-up").send(body);
    expect(test.status).toEqual(201);
    const exists = await supertest(app).post("/sign-in").send(login);
    expect(exists.status).toEqual(401);
  });

});