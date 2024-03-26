import { query } from "../../dbConnection.js";

const getStudents = async (req, res) => {
  try {
    const studentsDatabase = await query("SELECT * FROM students");
    console.log(req.usuario);
    if (studentsDatabase.rowCount > 0){
      const allStudents = studentsDatabase.rows[0];
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