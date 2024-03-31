import { GenerateTokenToValidateUserMail, HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";


const saveNewRegisteredUser = async (sql, userDataForRegister) => {
    
    try {
        
        const result = await connection.query(sql, userDataForRegister)

        if (result.rowCount === 0) {
            console.log('la propiedad rowCount indica que no hay registros insertados con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }
         
        return 

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


export default { saveNewRegisteredUser }