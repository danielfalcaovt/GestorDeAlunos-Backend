import { query } from "../../dbConnection.js";

function getStudentInfo(req) {
  const { first_name, cpf, module, parent } = req.body;
  const studentFirstName = first_name.toLowerCase();
  const studentModule = module.trim();
  const studentCPF = cpf.trim();
  const studentParent = parent.trim();
  return {
    studentFirstName,
    studentModule,
    studentCPF,
    studentParent
  };
}

const getSpecificStudent = async (req, res) => {
  try {
    const studentInfos = getStudentInfo(req);
    if(!studentInfos.studentCPF && !studentInfos.studentFirstName && studentInfos.studentModule === "Desconhecido" && !studentInfos.studentParent) {
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
      if (studentInfos.studentModule !== "Desconhecido") {
        paramCount > 1 ? params += " AND " : "";
        params += `module = $${paramCount}`;
        paramCount++
        passedParams.push(studentInfos.studentModule);
      }
    }
    if (studentInfos.studentParent) {
      paramCount > 1 ? params += " AND " : "";
      params += `parent = $${paramCount}`;
      paramCount++;
      passedParams.push(studentInfos.studentParent);
    }
    const checkIfStudentAlreadyExist = await query(`SELECT * FROM students WHERE ${params}`, passedParams);
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
