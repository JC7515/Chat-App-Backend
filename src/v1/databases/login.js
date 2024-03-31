import connection from "../../connectionDb.cjs";
import { ComparatePassword, GenerateAccessToken, GenerateRefreshToken } from "../utils/index.js";


const generateAccessToken = async (sql, emailToSearch) => {

    try {
        
        const result = await connection.query(sql, emailToSearch)


        if (result.rows.length === 0) {
            console.log(`User Not Found`)
            throw { status: 400, message: `Please enter a valid email.` }
        }

        return result


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


export default { generateAccessToken }