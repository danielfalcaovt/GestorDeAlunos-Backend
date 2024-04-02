import bcrypt from "bcryptjs";
import { query } from "../../dbConnection.js";
import jwt from "jsonwebtoken";
import env from "dotenv/config";

async function UserLogin(req, res) {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!checkParams(email, password)){
      return res.status(404).json({error: "Preencha todos os campos obrigatórios."});
    };

    const userInDatabase = await checkIfUserExist(email);
    if (userInDatabase) {
      bcrypt.compare(password, userInDatabase.password, (err, check)=>{
        if (err){
          return res
          .status(500)
          .json({error: "Erro no servidor interno."});
        }

        if (check) {
          const token = jwt.sign({ id:userInDatabase.id }, process.env.JSON_WEB_TOKEN, {
            expiresIn:"8hr"
          });
          const { password:_, ...user } = userInDatabase;
          return res
          .status(200)
          .json({
            user: user,
            token: token
          });
        }else{
          return res
          .status(402)
          .json({error: "Usuário e/ou senha incorretos."});
        }
      });
    }else{
      return res
      .status(404)
      .json({error: "Usuário não existente."})
    }

  } catch (error) {
    return res
    .status(500)
    .json({error: error.message})
  };
};

function checkParams(email, password) {
  if (email && password) {
    return true;
  } else {
    return false;
  };
};

async function checkIfUserExist(email) {
  try {
    const lowerCaseemail = email.toLowerCase();
    const checkedUser = await query("SELECT * FROM users WHERE LOWER(email) = $1", [lowerCaseemail]);
    if (checkedUser.rowCount > 0) {
      return checkedUser.rows[0];
    }else{
      return false;
    };
  } catch (error) {
    console.error(error);
    return false;
  };
};

export default UserLogin;