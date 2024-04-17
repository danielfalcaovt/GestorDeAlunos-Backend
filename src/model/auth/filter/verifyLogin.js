import jwt from 'jsonwebtoken'
import { query } from '../../dbConnection.js'
import 'dotenv/config'

async function verifyLogin (req, res, next) {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      return res.status(402).json({ error: 'Usuário não autênticado.' })
    }

    const userToken = userTokenTreatment(authorization)
    const user = jwt.verify(userToken, process.env.JSON_WEB_TOKEN)
    const { id } = user
    const userDatabaseResponse = await getUser(id)
    if (userDatabaseResponse) {
      const { password: _, ...usuario } = userDatabaseResponse
      req.usuario = usuario
      next()
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

function userTokenTreatment (userToken) {
  return userToken.replace('Bearer ', '')
}

async function getUser (userId) {
  try {
    const userInDatabase = await query('SELECT * FROM users WHERE id = $1', [
      userId
    ])
    if (userInDatabase.rowCount > 0) {
      return userInDatabase.rows[0]
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

export default verifyLogin
