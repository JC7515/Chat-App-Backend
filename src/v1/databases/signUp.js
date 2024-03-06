import { GenerateTokenToValidateUserMail, HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";


export const saveNewRegisteredUser = async (req, res) => {
    
    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}