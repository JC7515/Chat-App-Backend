import express from "express";
import { sendVerificationEmailByResend, verifyEmail } from "../controllers/emailsController.js";
import { verifyEmailToken } from "../middlewares/verifyEmailToken.js";

const router = express.Router()


// Aqui verificamos y actualizamos el estado del campo is_validated en la infomacion del usuario, que hace referencia a que si el usuario ya verifico su correo electronico y se valido que no es un bot   
router.get('/verifyEmail', verifyEmailToken, verifyEmail)


// Aqui enviamos un email de verificacion de correo electronico para el usuario para validar que el correo que ingreso sea suyo y que no se un both es que se registro
router.post('/resendVerifyEmail', sendVerificationEmailByResend)


export default router