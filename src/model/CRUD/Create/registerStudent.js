import { query } from "../../dbConnection.js";
import axios from "axios";

async function registerStudent(req, res) {
  try {
  const {
    first_name,
    last_name,
    cpf,
    module,
    address,
    cep,
    email,
    parent_name,
    phone
  } = req.body;
    if (missingRequiredParams(first_name, last_name, cpf, module)) {
      return res
        .status(404)
        .json({ error: "Preencha os campos obrigatórios." });
    }
    let paramIndex = 5;
    let paramIndexes = "$1, $2, $3, $4";
    let paramsNameToInsert = "first_name, last_name, cpf, module";
    let receivedParameters = [first_name, last_name, cpf, module];
    if (address) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex);
      paramsNameToInsert += addParamNameToInsertInDatabase("address");
      paramIndex++;
      receivedParameters.push(address);
    }
    if (cep) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex);
      paramsNameToInsert += addParamNameToInsertInDatabase("cep");
      paramIndex++;
      receivedParameters.push(cep);
    }
    if (email) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex);
      paramsNameToInsert += addParamNameToInsertInDatabase("email");
      paramIndex++;
      const validEmail = checkIfEmailIsValid(email);
      validEmail ? receivedParameters.push(email) : receivedParameters.push("Email Inválido.");
    }
    if (parent_name) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex);
      paramsNameToInsert += addParamNameToInsertInDatabase("parent");
      paramIndex++;
      receivedParameters.push(parent_name);
    }
    if (phone) {
      paramIndexes += addParamIndexToInsertInDatabase(paramIndex);
      paramsNameToInsert += addParamNameToInsertInDatabase("phone");
      paramIndex++;
      receivedParameters.push(phone);
    }

    if (await checkIfStudentAlreadyExist(cpf)) {
      return res.status(404).json({ error: "Estudante já existente." });
    }
    console.log(paramsNameToInsert);
    console.log(receivedParameters);
    const newStudentResponse = await query(
      `INSERT INTO students(${paramsNameToInsert}) VALUES(${paramIndexes}) RETURNING *`,
      receivedParameters
      );
      if (newStudentResponse.rowCount > 0) {
      console.log('...');
      const newStudent = newStudentResponse.rows[0];
      if (parent_name) {
        const parentResponse = await insertStudentParentInDatabase(
          parent_name,
          newStudent.student_id
        );
        if (!parentResponse) {
          return res.status(500).json({ error: "Erro Interno do Servidor." });
        }
      }
      return res.status(200).json({ user: newStudent });
    } else {
      return res.status(500).json({ error: "Erro no servidor interno." });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function getAddressFromCep(cep) {
  try {
    const address = await axios.get(`viacep.com.br/ws/${cep}/json/`);
    if (address) {
      return address;
    } else {
      return cep;
    }
  } catch (error) {
    return "CEP Inválido";
  }
}

async function checkIfEmailIsValid(email) {
    const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
    return emailRegex.test(email);
}

async function insertStudentParentInDatabase(parent_name, student_id) {
  try {
    const newStudentParentResponse = await query(
      "INSERT INTO parent(student_id, name) VALUES($1,$2) RETURNING *",
      [student_id, parent_name]
    );
    if (newStudentParentResponse.rowCount > 0) {
      const newStudentParent = newStudentParentResponse.rows[0];
      console.log(newStudentParent);
      return newStudentParent;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function checkIfStudentAlreadyExist(cpf) {
  try {
    const studentCpfDatabaseResponse = await query(
      "SELECT * FROM students WHERE cpf = $1",
      [cpf]
    );
    if (studentCpfDatabaseResponse.rows.length >= 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error.message;
  }
}

function missingRequiredParams(first_name, last_name, cpf, module) {
  if (!first_name && !last_name && !cpf && !module) {
    return true;
  } else {
    return false;
  }
}

function addParamIndexToInsertInDatabase(paramIndex) {
  let param;
  param = ", $";
  param += paramIndex;
  return param;
}

function addParamNameToInsertInDatabase(paramName) {
  let name;
  name = ", ";
  name += paramName;
  return name;
}

export default registerStudent;
