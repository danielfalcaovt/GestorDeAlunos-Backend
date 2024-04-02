import { query } from "../../dbConnection.js";

async function deleteStudent(req, res) {
  try {
    const { cpf } = req.params;
    console.log(req.usuario);
    const checkedUser = await checkIfStudentAlreadyExist(cpf);
    if (checkedUser === false) {
      return res.status(404).json({ error: "Usuário não existente." });
    } else if (checkedUser.message) {
      return res.status(500).json({ error: checkedUser.message });
    } else {
      const checkIfParent = checkedUser.rows[0].parent;
      if (checkIfParent) {
        const deletedParent = await query("DELETE FROM parent WHERE name = $1", [checkIfParent]);
        if (deletedParent.rowCount === 0) {
          console.log(deletedParent.rows);
          return res.status(500).json({error: "Erro interno do servidor."});
        }
      }
        const deletedUser = await query(
          "DELETE FROM students WHERE cpf = $1 RETURNING *", [cpf]);
          console.log(deletedUser.rows);
        if (deletedUser.rowCount > 0) {
          return res.status(200).json({ student: "Usuário removido com sucesso." });
        } else {
          return res.status(404).json({ error: "Erro interno do servidor." });
        }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  };
};

async function checkIfStudentAlreadyExist(cpf) {
  try {
    const userChecked = await query("SELECT * FROM students WHERE cpf = $1", [
      cpf,
    ]);
    if (userChecked.rowCount > 0) {
      return userChecked;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  };
};

export default deleteStudent;
