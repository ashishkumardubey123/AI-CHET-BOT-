import express from "express"
import { generateText } from "../Controller/generateController.js";



const generateRoute = express.Router()


  generateRoute.post("/generate-text", generateText);

  export default generateRoute
