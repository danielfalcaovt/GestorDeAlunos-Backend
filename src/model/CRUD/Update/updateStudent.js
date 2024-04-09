/* eslint-disable camelcase */
import { query } from '../../dbConnection.js'

async function updateStudent (req, res) {
  try {
    const {
      student_id,
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
    if (!checkIfRequiredParams(student_id)) {
      return res
        .status(404)
        .json({ error: 'Parâmetros obrigatórios devem ser preenchidos.' })
    }
    let paramCount = 2
    let params = 'student_id = $1'
    const paramsName = ['student_id']
    const passedParams = [student_id]

    if (first_name) {
      paramsName.push('first_name')
      params += `, first_name = $${paramCount}`
      paramCount++
      passedParams.push(first_name)
    }
    if (last_name) {
      paramsName.push('last_name')
      params += `, last_name = $${paramCount}`
      paramCount++
      passedParams.push(last_name)
    }
    if (cpf) {
      paramsName.push('cpf')
      params += `, cpf = $${paramCount}`
      paramCount++
      passedParams.push(cpf)
    }
    if (module) {
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
          moduleToSend = module
          break
      }
      paramsName.push('module')
      params += `, module = $${paramCount}`
      paramCount++
      passedParams.push(moduleToSend)
    }
    if (address) {
      paramsName.push('address')
      params += `, address = $${paramCount}`
      paramCount++
      passedParams.push(address)
    }
    if (cep) {
      paramsName.push('cep')
      params += `, cep = $${paramCount}`
      paramCount++
      passedParams.push(cep)
    }
    if (email) {
      paramsName.push('email')
      params += `, email = $${paramCount}`
      paramCount++
      passedParams.push(email)
    }
    if (parent) {
      console.log(parent)
      paramsName.push('parent')
      params += `, parent = $${paramCount}`
      paramCount++
      passedParams.push(parent)
    }
    if (phone) {
      paramsName.push('phone')
      params += `, phone = $${paramCount}`
      paramCount++
      passedParams.push(phone)
    }
    const checkIfStudentAlreadyExist = await query(
      'SELECT * FROM students WHERE student_id::text = $1',
      [student_id]
    )
    if (checkIfStudentAlreadyExist.rowCount > 0) {
      const checkIfAlreadyRegisteredCpf = await query(
        'SELECT * FROM students WHERE cpf = $1 AND student_id <> $2',
        [cpf, student_id]
      )
      if (checkIfAlreadyRegisteredCpf.rowCount > 0) {
        return res.status(404).json({ error: 'CPF já registrado.' })
      }
      const updatedStudent = await query(
        `UPDATE students SET ${params} WHERE student_id = ($1)::uuid RETURNING *`,
        passedParams
      )
      if (updatedStudent.rowCount > 0) {
        const student = updatedStudent.rows[0]
        return res.status(200).json({ student })
      } else {
        return res.status(404).json({
          error: 'Estudante não foi atualizado, revise os parâmetros passados.'
        })
      }
    } else {
      return res.status(404).json({ error: 'Estudante não existente.' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

function checkIfRequiredParams (first_name, last_name, cpf) {
  if (!first_name && !last_name && !cpf) {
    return false
  } else {
    return true
  }
}

export default updateStudent
