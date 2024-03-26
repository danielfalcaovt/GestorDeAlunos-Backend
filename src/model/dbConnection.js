import pg from "pg";
import env from "dotenv/config.js";

const database = new pg.Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
});

database.connect();

async function query(querySqlCode, dependencies) {
  const databaseResponse = await database.query(querySqlCode,dependencies);
  return databaseResponse;
};

export {
  database,
  query
};