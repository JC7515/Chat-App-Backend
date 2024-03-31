import connection from "../../connectionDb.cjs";
import { ComparatePassword, GenerateAccessToken, GenerateRefreshToken } from "../utils/index.js";
import login from "../databases/login.js";

const generateAccessToken = async (sql, emailToSearch, password) => {

    try {
        
        const result = await login.generateAccessToken(sql, emailToSearch)

        // IMPORTANTE: ya no se hace un bucle, porque previamente se hizo una validacion usersRouters para validad que el email de cada usuario sea unico en la db, por lo que aca la consulta nos estaria devolviendo un solo usuario, ya no un grupo 

        const userData = result.rows[0]

        const isTheCorrectPassword = await ComparatePassword(password, userData.password)

        // console.log(isTheCorrectPassword)

        if (!isTheCorrectPassword) throw { status: 401, message: 'Incorrect email or password. Please try again.' }


        const generateAccessToken = GenerateAccessToken(userData.user_id)

        const generateRefreshToken = GenerateRefreshToken(userData.user_id)

        return {
            generateAccessToken: generateAccessToken,
            generateRefreshToken: generateRefreshToken
        }


    } catch (error) {
        throw error
    }
}



export default { generateAccessToken }