/* eslint-disable no-unused-vars */
import pg from 'pg'
import env from 'dotenv/config.js'

const database = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'EnglishFaster',
  user: 'postgres',
  password: 'brbr109br'
})

database.connect()

async function query (querySqlCode, dependencies) {
  const databaseResponse = await database.query(querySqlCode, dependencies)
  return databaseResponse
}

export { database, query }
