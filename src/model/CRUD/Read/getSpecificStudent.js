import pg from "pg";
import { query } from "../../dbConnection.js";

function getStudentInfo(req) {
  const {first_name, last_name, cpf} = req.body;
  const studentFirstName = fName.toLowerCase();
  const studentLastName = lName.toLowerCase();

  return {studentFirstName, studentLastName}
};

const getSpecificStudent = async (req, res) => {
  try {
    const studentName = getStudentInfo(req);

    if (studentName.studentFirstName.length > 0 && studentName.studentLastName.length > 0) {
      const databaseResponse = await query("SELECT * FROM students WHERE LOWER(first_name) LIKE '%$1%' OR LOWER(last_name) LIKE '%$2%' OR cpf = $3",[studentName.studentFirstName, studentName.studentLastName, studentCPF]);

      if (databaseResponse.rowCount > 0) {
        console.log(databaseResponse.rows[0]);
        const foundStudents = databaseResponse.rows[0];
        console.log(foundStudents);
        return res
        .status(200)
        .json({student: foundStudents});
      }else {
        return res
        .status(404)
        .json({error: "Estudante não encontrado."});
      };
    }else{
     return res
     .status(404)
     .json({error: "Parâmetros Inválidos e/ou Faltando, Preencha os campos requisitados."});
    };
  } catch (err) {
    console.error(err.message);
    return res
    .status(500)
    .json({error:"Internal Server Error"});
  };
};

export {
  getSpecificStudent
};