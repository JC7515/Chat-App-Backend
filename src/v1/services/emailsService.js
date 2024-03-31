import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";
import { GenerateTokenToValidateUserMail } from "../utils/index.js";
import emails from '../databases/emails.js'



const verifyEmail = async (userData, dataForUptade, sqlForValidateUser, sqlForUpdateEmailStatus) => {

    try {

        const result = await emails.verifyEmail(userData, dataForUptade, sqlForValidateUser, sqlForUpdateEmailStatus)

        return result


    } catch (error) {
        throw error
    }
}


const sendVerificationEmailByResend = async (userData, sqlForValidateUser, email) => {

    try {


        // 1)
        // ************Aqui validamos si el email que envio el usario pertenece a algun usuario en la base de datos ************
        const user = await emails.sendVerificationEmailByResend(userData, sqlForValidateUser)

        // 2)
        // **********Aqui reenviamos la validacion de correo al correo que proporciono el usuario  ***********
        const tokenForValidateEmail = GenerateTokenToValidateUserMail(user.user_id)

        console.log(tokenForValidateEmail)

        const validationUrl = `http://localhost:3000/emailVerification/${tokenForValidateEmail}`

        // const sendEmailValidation = await SendEmailValidation(email, validationUrl)

        await SendEmailValidation(email, validationUrl)

        return 

    } catch (error) {
        throw error
    }
}


export default { verifyEmail, sendVerificationEmailByResend }