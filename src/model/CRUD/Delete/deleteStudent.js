/* eslint-disable camelcase */
import { query } from '../../dbConnection.js'

async function deleteStudent (req, res) {
  try {
    const { cpf } = req.params
    const checkedUser = await checkIfStudentAlreadyExist(cpf)
    if (checkedUser === false) {
      return res.status(404).json({ error: 'Usuário não existente.' })
    } else if (checkedUser.message) {
      return res.status(500).json({ error: checkedUser.message })
    } else {
      const studentId = checkedUser.rows[0].student_id
      if (await checkIfParentExist(studentId)) {
        console.log(checkedUser.rows[0].student_id)
        const deletedParent = await query(
          'DELETE FROM parent WHERE student_id = ($1)::uuid',
          [checkedUser.rows[0].student_id]
        )
        console.log(deletedParent.rows)
        if (deletedParent.rowCount <= 0) {
          return res.status(500).json({ error: 'Erro interno do Servidor.' })
        }
      }
      const deletedUser = await query(
        'DELETE FROM students WHERE cpf = $1 RETURNING *',
        [cpf]
      )
      console.log(deletedUser.rows)
      if (deletedUser.rowCount > 0) {
        return res
          .status(200)
          .json({ student: 'Usuário removido com sucesso.' })
      } else {
        return res.status(404).json({ error: 'Erro interno do servidor.' })
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

async function checkIfStudentAlreadyExist (cpf) {
  try {
    const userChecked = await query('SELECT * FROM students WHERE cpf = $1', [
      cpf
    ])
    if (userChecked.rowCount > 0) {
      return userChecked
    } else {
      return false
    }
  } catch (error) {
    return error
  }
}

async function checkIfParentExist (student_id) {
  try {
    const databaseResponse = await query(
      'SELECT * FROM parent WHERE student_id = ($1)::uuid',
      [student_id]
    )

    if (databaseResponse.rowCount > 0) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

export default deleteStudent
