import express from "express";
import routes from "./routes/routes.js";
import cors from "cors";
import "dotenv/config.js";
import bodyParser from "body-parser";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(routes);

app.listen(port, ()=> {
    console.log(`Server is running in ${port} port.`);
});