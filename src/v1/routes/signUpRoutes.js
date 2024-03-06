import express from "express";
import { saveNewRegisteredUser } from "../controllers/signUpController.js";
const router = express.Router()

router.post('/signUp', saveNewRegisteredUser)


export default router