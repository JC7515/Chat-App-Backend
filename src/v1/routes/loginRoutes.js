import express from "express";
import { generateAccessToken } from "../controllers/loginController.js";

const router = express.Router()


router.post('/auth/login', generateAccessToken)


export default router