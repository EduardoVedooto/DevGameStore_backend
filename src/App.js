import express from "express";
import cors from "cors";
import connection from "./database/Database.js";
import userSchema from "./schema/newUser.schema.js";
import messageSchema from "./schema/newMessage.schema.js";
import bcrypt from "bcrypt";
import userSanitization from "./sanitization/newUser.js";
import messageSanitization from "./sanitization/newMessage.js";
import { v4 as uuid } from "uuid";

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
  try{
    const games = await connection.query(`SELECT * FROM games;`);
    res.status(200).send(games.rows)
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/games/:category", async (req, res) => {
  const { category } = req.params;
  try{
    const games = await connection.query(`SELECT * FROM games WHERE category = $1`, [category]);
    res.status(200).send(games.rows)
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/game/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try{
    const game = await connection.query(`SELECT * FROM games WHERE id = $1`, [id]);
    res.status(200).send(game.rows[0])
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/gamelist", async (req, res) => {
  const {gamename} = req.query;
  try{
    const gameRequest = await connection.query('SELECT * FROM games WHERE name ILIKE $1', ["%" + gamename + "%"]);
    res.status(200).send(gameRequest.rows)
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/contact-us", async (req, res) =>{
  const validation = messageSchema(req.body);
  if (validation.error) {
    return res.status(400).send(validation.error.details[0]);
  }
  const { email, subject, message } = messageSanitization(req.body);
  try{
    await connection.query('INSERT INTO contact (email, subject, message) VALUES ($1, $2, $3)', [email, subject, message]);
    res.sendStatus(200);
  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }
  
});

export default app;