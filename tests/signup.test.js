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

describe("POST /sign-up", () => {

    it("returns status 201 for valid params", async () => {
       const body = {
           "name": "gamestore",
           "email": "gamestore@gmail.com",
           "password": "gamestorepassword", 
           "picture": "http://examplepicture.jpg"
       }
       const test = await supertest(app).post("/sign-up").send(body);
       expect(test.status).toEqual(201);
   });

   it("returns status 201 for valid name, email and password but no picture", async () => {
    const body = {
        "name": "gamestore",
        "email": "gamestore@gmail.com",
        "password": "gamestorepassword"
    }
    const test = await supertest(app).post("/sign-up").send(body);
    expect(test.status).toEqual(201);
    });

    it("returns status 400 for invalid name (less than 3 characters)", async () => {
        const body = {
            "name": "ga",
            "email": "gamestore@gmail.com",
            "password": "gamestorepassword"
        }
        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(400);
    });

    it("returns status 400 for invalid name (more than 40 characters)", async () => {
        const body = {
            "name": "gamestoregamestoregamestoregamestoregames",
            "email": "gamestore@gmail.com",
            "password": "gamestorepassword"
        }
        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(400);
    });

    it("returns status 400 for invalid name (name contains a number)", async () => {
        const body = {
            "name": "gamestore2",
            "email": "gamestore@gmail.com",
            "password": "gamestorepassword"
        }
        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(400);
    });

    it("returns status 400 for invalid email", async () => {
        const body = {
            "name": "gamestore",
            "email": "gamestore",
            "password": "gamestorepassword"
        }
        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(400);
    });

    it("returns status 400 for invalid password (less than 6 characters)", async () => {
        const body = {
            "name": "gamestore",
            "email": "gamestore@gmail.com",
            "password": "games"
        }
        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(400);
    });

    it("returns status 401 for email already registered (even if the other credentials are different)", async () => {
        const body = {
            "name": "gamestore",
            "email": "gamestore@gmail.com",
            "password": "gamestorepassword"
        }

        const same = {
            "name": "gamestoreagain",
            "email": "gamestore@gmail.com",
            "password": "gamestorepassword2"
        }

        const test = await supertest(app).post("/sign-up").send(body);
        expect(test.status).toEqual(201);
        const exists = await supertest(app).post("/sign-up").send(same);
        expect(exists.status).toEqual(401);
    });
    
});