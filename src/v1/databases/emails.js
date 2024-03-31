import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";
import { GenerateTokenToValidateUserMail } from "../utils/index.js";



const verifyEmail = async (userData, dataForUptade, sqlForValidateUser, sqlForUpdateEmailStatus) => {

    try {
        

        // 1)
        // ************Aqui validamos si el id del token le pertenece a algun usuario en la base de datos ************

        const result = await connection.query(sqlForValidateUser, userData)

        const resultOfGetUserData = result.rows

        if (resultOfGetUserData.length === 0) {
            console.log(`User Not Found`)
            throw { status: 404, message: `User profile not found.` }
        }

        const user = result.rows[0]

        // 2)
        // **********Aqui actualizamos el  el estado del campo is_validate del registro de usuario ***********

        const resultOfUpdate = await connection.query(sqlForUpdateEmailStatus, dataForUptade)


        if (resultOfUpdate.rowCount === 0) {
            console.log(`No se realizo la actualizacion con exito`)
            throw { status: 404, message: `an error occurred, try again.` }
        }

        return user


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


const sendVerificationEmailByResend = async (userData, sqlForValidateUser) => {

    try {
        
        const result = await connection.query(sqlForValidateUser, userData)

        const resultOfGetUserData = result.rows

        if (resultOfGetUserData.length === 0) {
            console.log(`User Not Found`)
            throw { status: 404, message: `Email not registered. Verify the address or register to create an account.` }
        }

        const user = result.rows[0]

        return user


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


export default { verifyEmail, sendVerificationEmailByResend }