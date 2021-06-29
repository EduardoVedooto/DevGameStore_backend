import express from "express";
import cors from "cors";
import connection from "./database/Database.js";
import userSchema from "./schema/newUser.schema.js";
import bcrypt from "bcrypt";
import userSanitization from "./sanitization/newUser.js";

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

export default app;