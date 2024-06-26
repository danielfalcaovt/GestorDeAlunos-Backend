/* eslint-disable camelcase */
import { query } from '../../dbConnection.js'

async function registerStudent (req, res) {
  try {
    const identificadorDoRegistrador = req.usuario.username
    const {
      first_name,
      last_name,
      cpf,
      module,
      address,
      cep,
      email,
      parent,
      phone
    } = req.body
    if (missingRequiredParams(first_name, last_name, cpf, module)) {
      return res.status(404).json({ error: 'Preencha os campos obrigatórios.' })
    }
    let paramIndex = 6
    let paramIndexes = '$1, $2, $3, $4, $5'
    let paramsNameToInsert = 'cadastrador, first_name, last_name, cpf, module'
    let moduleToSend
    switch (module) {
      case 'B':
        moduleToSend = 'Básico'
        break
      case 'I':
        moduleToSend = 'Intermediário'
        break
      case 'P':
        moduleToSend = 'Pré - Intermediário'
        break
      case 'A':
        moduleToSend = 'Avançado'
        break
      default:
        moduleToSend = 'Indefinido'
        break
    }
    const receivedParameters = [
      identificadorDoRegistrador,
      first_name,
      last_name,
      cpf,
      moduleToSend
    ]
    if (address) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex)
      paramsNameToInsert += addParamNameToInsertInDatabase('address')
      paramIndex++
      receivedParameters.push(address)
    }
    if (cep) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex)
      paramsNameToInsert += addParamNameToInsertInDatabase('cep')
      paramIndex++
      receivedParameters.push(cep)
    }
    if (email) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex)
      paramsNameToInsert += addParamNameToInsertInDatabase('email')
      paramIndex++
      const validEmail = checkIfEmailIsValid(email)
      validEmail
        ? receivedParameters.push(email)
        : receivedParameters.push('Email Inválido.')
    }
    if (parent) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex)
      paramsNameToInsert += addParamNameToInsertInDatabase('parent')
      paramIndex++
      receivedParameters.push(parent)
    }
    if (phone) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex)
      paramsNameToInsert += addParamNameToInsertInDatabase('phone')
      paramIndex++
      receivedParameters.push(phone)
    }

    if (await checkIfStudentAlreadyExist(cpf)) {
      return res.status(404).json({ error: 'Estudante já existente.' })
    }
    const newStudentResponse = await query(
      `INSERT INTO students(${paramsNameToInsert}) VALUES(${paramIndexes}) RETURNING *`,
      receivedParameters
    )
    if (newStudentResponse.rowCount > 0) {
      const newStudent = newStudentResponse.rows[0]
      if (parent) {
        const parentResponse = await insertStudentParentInDatabase(
          parent,
          newStudent.student_id
        )
        if (!parentResponse) {
          return res.status(500).json({ error: 'Erro Interno do Servidor.' })
        }
      }
      return res.status(200).json({ user: newStudent })
    } else {
      return res.status(500).json({ error: 'Erro no servidor interno.' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error })
  }
}

async function checkIfEmailIsValid (email) {
  const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/gm
  return emailRegex.test(email)
}

async function insertStudentParentInDatabase (parent, student_id) {
  try {
    const newStudentParentResponse = await query(
      'INSERT INTO parent(student_id, name) VALUES($1,$2) RETURNING *',
      [student_id, parent]
    )
    if (newStudentParentResponse.rowCount > 0) {
      const newStudentParent = newStudentParentResponse.rows[0]
      return newStudentParent
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

export async function checkIfStudentAlreadyExist (cpf) {
  try {
    const studentCpfDatabaseResponse = await query(
      'SELECT * FROM students WHERE cpf = $1',
      [cpf]
    )
    if (studentCpfDatabaseResponse.rows.length >= 1) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return error.message
  }
}

function missingRequiredParams (first_name, last_name, cpf, module) {
  if (!first_name && !last_name && !cpf && !module) {
    return true
  } else {
    return false
  }
}

function addParamIndexToInsertInDatabase (paramIndex) {
  let param
  param = ', $'
  param += paramIndex
  return param
}

function addParamNameToInsertInDatabase (paramName) {
  let name
  name = ', '
  name += paramName
  return name
}

export default registerStudent
