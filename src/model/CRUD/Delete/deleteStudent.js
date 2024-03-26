import { query } from "../../dbConnection.js";

async function deleteStudent(req, res) {
  try {
    const { cpf } = req.body;
    const checkedUser = await checkIfStudentAlreadyExist(cpf);
    if (checkedUser === false) {
      return res.status(404).json({ error: "Usuário não existente." });
    } else if (checkedUser.message) {
      return res.status(500).json({ error: checkedUser.message });
    } else {
      const deletedUser = await query(
        "DELETE FROM students WHERE cpf = $1 RETURNING *", [cpf]);
      if (deletedUser.rowCount > 0) {
        return res.status(404).json({ error: "Erro interno do servidor." });
      } else {
        return res.status(200).json({ user: "Usuário removido com sucesso." });
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
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  };
};

export default deleteStudent;
