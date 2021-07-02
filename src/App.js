import express from "express";
import cors from "cors";
import connection from "./database/Database.js";
import userSchema from "./schema/newUser.schema.js";
import messageSchema from "./schema/newMessage.schema.js";
import bcrypt from "bcrypt";
import userSanitization from "./sanitization/newUser.js";
import messageSanitization from "./sanitization/newMessage.js";
import { v4 as uuid } from "uuid";
import cardSchema from "./schema/card.schema.js";
import cardSanitization from "./sanitization/card.js";

const app = express();
app.use(cors());
app.use(express.json());

/*
 * Rotas 
 */

app.post("/sign-up", async (req, res) => {
  const validation = userSchema(req.body);
  if (validation.error) {
    return res.status(400).send(validation.error.details[0]);
  }
  const { name, email, password, picture } = userSanitization(req.body);

  try {
    const verifyEmail = await connection.query("SELECT * FROM users WHERE email = $1", [email]);
    if (verifyEmail.rowCount) return res.sendStatus(401);

    await connection.query(`
      INSERT INTO users
      (name, email, password, picture)
      VALUES ($1,$2,$3,$4);
    `, [name, email, bcrypt.hashSync(password, 10), picture ? picture : null]);
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await connection.query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);


    if (!result.rowCount || !bcrypt.compareSync(password, result.rows[0].password)) {
      res.status(401).send("Email ou senha inválidos");
    } else {
      const user = result.rows[0];
      const token = uuid();
      delete user.password;
      await connection.query(`
        INSERT INTO sessions 
        ("userId", token) 
        VALUES ($1,$2)
      `, [user.id, token]);
      res.status(200).send({ user, token });
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const games = await connection.query(`SELECT * FROM games;`);
    res.status(200).send(games.rows)
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/games/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const games = await connection.query(`SELECT * FROM games WHERE category = $1`, [category]);
    res.status(200).send(games.rows)
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const game = await connection.query(`SELECT * FROM games WHERE id = $1`, [id]);
    res.status(200).send(game.rows[0])
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/cart", async (req, res) => {
  console.log(req.body);
  const ids = req.body.ids;

  console.log(ids);

  if (!ids || !ids.length) return res.sendStatus(400);

  let query = "SELECT id, name, price, image FROM games WHERE id = $1";

  for (let index = 1; index < ids.length; index++) {
    query += ` OR id = $${index + 1}`;
  }

  console.log(query, ids);
  try {
    const response = await connection.query(query, ids);
    const games = response.rows;

    if (response.rowCount !== ids.length) {

      const idsWanted = {};

      for (let i = 0; i < ids.length; i++) {
        idsWanted[ids[i]] = ids[i];
      }

      const gamesFounded = games.filter(game => idsWanted[game.id]);
      if (gamesFounded.length === 0) return res.sendStatus(404);

      return res.status(206).send(gamesFounded);
    }


    res.send(response.rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get("/gamelist", async (req, res) => {
  const { gamename } = req.query;
  try {
    const gameRequest = await connection.query('SELECT * FROM games WHERE name ILIKE $1', ["%" + gamename + "%"]);
    res.status(200).send(gameRequest.rows)
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/contact-us", async (req, res) => {
  const validation = messageSchema(req.body);
  if (validation.error) {
    return res.status(400).send(validation.error.details[0]);
  }
  const { email, subject, message } = messageSanitization(req.body);
  try {
    await connection.query('INSERT INTO contact (email, subject, message) VALUES ($1, $2, $3)', [email, subject, message]);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/checkout", async (req, res) => {
  try {
    // TOKEN
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token || !token.trim().length) return res.sendStatus(401);
    const response = await connection.query("SELECT * FROM sessions WHERE token = $1", [token]);
    if (!response.rowCount) return res.sendStatus(404);
    const { userId } = response.rows[0];

    // Payment Method
    const type = req.query.type;
    if (!(type === "deb" || type === "cre" || type === "pix" || type === "bol")) return res.sendStatus(400);
    if (type === "deb" || type === "cre") {
      const validation = cardSchema(req.body.card);
      if (validation.error) return res.status(400).send(validation.error.details[0]);
      const { name, number, cvv, month, year } = cardSanitization(req.body.card);

      const previousCard = await connection.query(`SELECT id FROM cards WHERE "userId" = $1 AND cvv = $2 AND type = $3`,
        [userId, cvv, type]);
      if (!previousCard.rowCount) {
        await connection.query(`
        INSERT INTO cards 
        (name, number, cvv, month, year, "userId", type) 
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [name, bcrypt.hashSync(number, 10), cvv, month, year, userId, type]);
      }
    }

    const games = req.body.games;
    if (!games.length) return res.sendStatus(400);
    const totalPrice = req.body.total;
    const timestamp = Date.now();

    for (let i = 0; i < games.length; i++) {
      await connection.query(`
        INSERT INTO sales 
        (date, "userId", "gameId", "saleId", type, "gamePrice", "totalPrice")
        VALUES (NOW(), $1, $2, $3, $4, $5, $6)  
      `, [userId, games[i].id, timestamp, type, games[i].price, totalPrice]);
    }

    res.sendStatus(200);

  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});


export default app;