import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";
import { GenerateTokenToValidateUserMail } from "../utils/index.js";



export const verifyEmail = async (req, res) => {

    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


export const sendVerificationEmailByResend = async (req, res) => {

    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}