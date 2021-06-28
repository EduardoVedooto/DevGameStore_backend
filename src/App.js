import express from "express";
import cors from "cors";
import connection from "./database/Database.js";

const app = express();
app.use(cors());
app.use(express.json());

/*
 * Rotas 
 */

export default app;