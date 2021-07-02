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

describe("POST /contact-us", () => {

  it("returns status 201 for valid email", async () => {
    const body = {
      "email": "gamestore@gmail.com",
      "subject": "gamestoresubject",
      "message": "gamestoremessage"
    }
    const test = await supertest(app).post("/contact-us").send(body);
    expect(test.status).toEqual(201);
  });

  it("returns status 400 for invalid email", async () => {
    const body = {
      "email": "gamestore",
      "subject": "gamestoresubject",
      "message": "gamestoremessage"
    }
    const test = await supertest(app).post("/contact-us").send(body);
    expect(test.status).toEqual(400);
  });

  it("returns status 400 for invalid subject (less than 3 characters)", async () => {
    const body = {
      "email": "gamestore@gmail.com",
      "subject": "ga",
      "message": "gamestoremessage"
    }
    const test = await supertest(app).post("/contact-us").send(body);
    expect(test.status).toEqual(400);
  });

  it("returns status 400 for invalid message (less than 3 characters)", async () => {
    const body = {
      "email": "gamestore@gmail.com",
      "subject": "gamestore",
      "message": "ga"
    }
    const test = await supertest(app).post("/contact-us").send(body);
    expect(test.status).toEqual(400);
  });

});