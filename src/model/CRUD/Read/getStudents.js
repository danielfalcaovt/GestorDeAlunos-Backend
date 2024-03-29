import { query } from "../../dbConnection.js";

const getStudents = async (req, res) => {
  try {
    const studentsDatabase = await query("SELECT * FROM students");
    console.log(req.usuario);
    if (studentsDatabase.rowCount > 0){
      const allStudents = studentsDatabase.rows;
      allStudents.map((student)=>{
        const cpf = student.cpf;
        const validCPF = cpf.trim();
        if (validCPF.length === 11) {
          student.cpf = validCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }else{
          student.cpf = "CPF INVÁLIDO";
        }
      });
      console.log(allStudents);
      return res
      .status(200)
      .json({students:allStudents});
    }else{
      return res
      .status(404)
      .json({error: "404 Not Found."});
    };
  } catch (err) {
    console.error(err);
    return res.status(404).json({error: err.message});
  };
};

export { 
  getStudents
};