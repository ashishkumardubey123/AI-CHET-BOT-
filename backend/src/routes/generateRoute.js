import express from "express"
import { generateContent } from "../Controller/generateController.js";



const generateRoute = express.Router()


  generateRoute.post("/generate", generateContent);

  export default generateRoute