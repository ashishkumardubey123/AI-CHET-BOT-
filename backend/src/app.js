import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoute from "./routes/generateRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", generateRoute)




export default app;
