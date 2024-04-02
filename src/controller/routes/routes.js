import { Router } from "express";
import { getStudents } from "../../model/CRUD/Read/getStudents.js";
import { getSpecificStudent } from "../../model/CRUD/Read/getSpecificStudent.js";
import registerStudent from "../../model/CRUD/Create/registerStudent.js";
import deleteStudent from "../../model/CRUD/Delete/deleteStudent.js";
import updateStudent from "../../model/CRUD/Update/updateStudent.js";
import UserRegister from "../../model/auth/UserRegister/UserRegister.js";
import UserLogin from "../../model/auth/UserLogin/UserLogin.js";
import verifyLogin from "../../model/auth/filtro/verifyLogin.js";

const routes = Router();

routes.post("/register", UserRegister);
routes.post("/login", UserLogin);

routes.use(verifyLogin);

routes.get("/api", getStudents);

routes.post("/api/search", getSpecificStudent);

routes.post("/api/register", registerStudent);

routes.delete("/api/delete/:cpf", deleteStudent);

routes.patch("/api/update", updateStudent);

export default routes;