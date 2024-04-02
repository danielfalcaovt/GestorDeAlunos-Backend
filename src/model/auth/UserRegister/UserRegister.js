import bcrypt from "bcryptjs";
import { query } from "../../dbConnection.js";
import jwt from "jsonwebtoken";

async function UserRegister(req, res) {
  try {
    const { username, email, confirmEmail, password, confirmPassword } = req.body;

    if (checkParams(username, email, confirmEmail, password, confirmPassword) === false) {
      return res.status(404).json({ error: "Email e/ou senha inválidos." });
    };
    if (await userAlreadyExist(email)) {
      return res.status(404).json({ error: "Usuario já existente." });
    };

    bcrypt.hash(password, 10, async (err, hashedPassword)  =>{
      if (err) {
        return res
        .status(500)
        .json({error: "Internal Server Error."});
      }
      const newUser = await query("INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *",[username, email, hashedPassword]);
      if (newUser.rowCount > 0) {
        return res
        .status(200)
        .json({user: newUser.rows[0]});
      } else {
        return res
        .status(500)
        .json({error: "Erro do servidor interno."})
      };
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro do servidor interno." });
  };
};

function checkParams(username, email, confirmEmail, password, confirmPassword) {
  if (!username && !email && !password && !confirmPassword) {
    return false;
  } else if (email !== confirmEmail) {
    return false;
  } else if (password !== confirmPassword) {
    return false;
  } else {
    return paramsSecurityValidate(email, password);
  };
};

function paramsSecurityValidate(email, password) {
  const badEmail = email;
  const badPassword = password;
  const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
  if (!emailRegex.test(badEmail)) {
    return false;
  };
  const passRegex = /^((?=\S*?[A-Za-z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;
  if (!passRegex.test(badPassword)) {
    return false;
  };
  return true;
};

async function userAlreadyExist(email) {
  try {
    const checkUser = await query("SELECT * FROM users WHERE email = $1", [email,]);
    if (checkUser.rows.length > 0) {
      console.log('?');
      return true;
    } else {
      console.log('ue');
      return false;
    }
  } catch (error) {
    return error.message;
  };
};

export default UserRegister;
