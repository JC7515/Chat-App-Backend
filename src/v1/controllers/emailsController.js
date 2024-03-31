import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";
import { GenerateTokenToValidateUserMail } from "../utils/index.js";
import emailsService from '../services/emailsService.js'



export const verifyEmail = async (req, res) => {

    const { userId } = req.user

    // 1) 
    const sqlForValidateUser = 'SELECT email FROM users WHERE user_id = $1'

    // 2) 
    const sqlForUpdateEmailStatus = "UPDATE users SET is_validated = $1 WHERE user_id = $2"


    try {


        // 1)
        // ************Aqui validamos si el id del token le pertenece a algun usuario en la base de datos ************
        const userData = [userId]


        // 2)
        // **********Aqui actualizamos el  el estado del campo is_validate del registro de usuario ***********
        const newStatusOfEmail = 'true'
        const dataForUptade = [newStatusOfEmail, userId]



        const user = await emailsService.verifyEmail(userData, dataForUptade, sqlForValidateUser, sqlForUpdateEmailStatus)


        const data = {
            email: user.email
        }


        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}


export const sendVerificationEmailByResend = async (req, res) => {

    const { email } = req.body

    // 1) 
    const sqlForValidateUser = 'SELECT user_id, email FROM users WHERE email = $1'

    try {


        // 1)
        // ************Aqui validamos si el email que envio el usario pertenece a algun usuario en la base de datos ************
        const userData = [email]


     
        await emailsService.verifyEmail(userData, sqlForValidateUser, email)
        

        const data = {
            message: 'Email verification was forwarded, check your inbox'
        }
        res.status(201).json({ status: "OK", data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /resendVerifyEmail :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}