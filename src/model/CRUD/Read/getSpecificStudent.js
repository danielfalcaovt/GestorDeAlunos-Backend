import { query } from "../../dbConnection.js";

function getStudentInfo(req) {
  const { first_name, cpf, module } = req.body;
  const studentFirstName = first_name.toLowerCase();
  const studentModule = module.trim();
  const studentCPF = cpf.trim();
  return {
    studentFirstName,
    studentModule,
    studentCPF,
  };
}

const getSpecificStudent = async (req, res) => {
  try {
    const studentInfos = getStudentInfo(req);
    if(!studentInfos.studentCPF && !studentInfos.studentFirstName && studentInfos.studentModule === "Desconhecido") {
      return res
      .status(404)
      .json({error: "Parâmetros obrigatórios devem ser preenchidos."})
    };

    let paramCount = 1;
    let params = ``;
    let passedParams = [];
    
    if (studentInfos.studentFirstName) {
      params += `LOWER(first_name) LIKE $${paramCount}`;
      paramCount++
      passedParams.push("%" + studentInfos.studentFirstName + "%");
    }
    if (studentInfos.studentCPF) {
      paramCount > 1 ? params += " AND " : "";
      params += `cpf = $${paramCount}`;
      paramCount++
      passedParams.push(studentInfos.studentCPF);
    }
    if (studentInfos.studentModule) {
      console.log(studentInfos.studentModule);
      if (studentInfos.studentModule !== "Desconhecido") {
        console.log('MANO.');
        paramCount > 1 ? params += " AND " : "";
        params += `module = $${paramCount}`;
        paramCount++
        passedParams.push(studentInfos.studentModule);
      }
    }
    console.log(params);
    console.log(passedParams);
    const checkIfStudentAlreadyExist = await query(`SELECT * FROM students WHERE ${params}`, passedParams);
    console.log(checkIfStudentAlreadyExist.rows);
    if (checkIfStudentAlreadyExist.rows.length > 0) {
      res.status(200).json({students: checkIfStudentAlreadyExist.rows});
    }else {
      res.status(404).json({error: "Estudante não encontrado."})
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getSpecificStudent };
