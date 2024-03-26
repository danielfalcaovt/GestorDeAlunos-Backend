import { query } from "../../dbConnection.js";

async function updateStudent(req, res) {
  try {
    const {
      first_name,
      last_name,
      cpf,
      module,
      address,
      cep,
      email,
      parent
    } = req.body;
    if(!checkIfRequiredParams(first_name, last_name, cpf)){
      return res
      .status(404)
      .json({error: "Parâmetros obrigatórios devem ser preenchidos."})
    };
    let paramCount = 4;
    let params = `first_name = $1, last_name = $2, cpf = $3`;
    let paramsName = ["first_name", "last_name", "cpf"];
    let passedParams = [first_name, last_name, cpf];
    if (module) {
      paramsName.push("module");
      params += `, ${paramsName[paramCount -1]} = $${paramCount}`;
      paramCount++
      passedParams.push(module);
    }
    if (address) {
      paramsName.push("address");
      params += `, ${paramsName[paramCount -1]} = $${paramCount}`;
      paramCount++
      passedParams.push(address);
    }
    if (cep) {
      paramsName.push("cep");
      params += `, ${paramsName[paramCount -1]} = $${paramCount}`;
      paramCount++
      passedParams.push(cep);
    }
    if (email) {
      paramsName.push("email");
      params += `, ${paramsName[paramCount -1]} = $${paramCount}`;
      paramCount++
      passedParams.push(email);
    }
    if (parent) {
      paramsName.push("parent");
      params += `, ${paramsName[paramCount -1]} = $${paramCount}`;
      paramCount++
      passedParams.push(parent);
    }
    console.log(params);
    const checkIfStudentAlreadyExist = await query("SELECT * FROM students WHERE cpf = $1", [cpf]);
    if (checkIfStudentAlreadyExist.rowCount > 0) {
      const targetStudent = checkIfStudentAlreadyExist.rows[0];
      console.log(targetStudent.student_id);
     const updatedStudent = await query(`UPDATE students SET ${params} WHERE student_id = '${targetStudent.student_id}' RETURNING *`, passedParams);
     if (updatedStudent.rowCount > 0) {
      const student = updatedStudent.rows[0];

      return res
      .status(200)
      .json({student:student});
     }else{
      return res
      .status(404)
      .json({error: "Estudante não foi atualizado, revise os parâmetros passados."});
     }
    }else{
      return res
      .status(404)
      .json({error: "Estudante não existente."});
    }
  } catch (error) {
    return res
    .status(500)
    .json({error:error.message});
  };
};

function checkIfRequiredParams(first_name, last_name, cpf) {
  if (!first_name && !last_name && !cpf) {
    return false
  }else{
    return true
  };
};

export default updateStudent;