import { GenerateTokenToValidateUserMail, HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";
import signUp from "../databases/signUp.js";

export const saveNewRegisteredUser = async (sql, userDataForRegister, user_id, email) => {
    
    try {


        await signUp.saveNewRegisteredUser(sql, userDataForRegister)


        // ************** Aqui tenemos la logica para enviar el correo de verificacion de correo electronico al usuario, para validar que su correo sea real y no un both************

        // const tokenForValidateEmail = GenerateTokenToValidateUserMail(user_id)

        // console.log(tokenForValidateEmail)

        // const validationUrl = `http://localhost:3000/emailVerification/${tokenForValidateEmail}`

        // // const sendEmailValidation = await SendEmailValidation(email, validationUrl)

        // await SendEmailValidation(email, validationUrl)
        

        return


    } catch (error) {
        throw error
    }
}


export default { saveNewRegisteredUser }