import connection from "../../connectionDb.cjs";
import loginService from "../services/loginService.js";
import { ComparatePassword, GenerateAccessToken, GenerateRefreshToken } from "../utils/index.js";


export const generateAccessToken = async (req, res) => {

    const { email, password } = req.body
    // console.log(email, password)

    const sql = 'SELECT * FROM users WHERE email = $1'

    const emailToSearch = [email]

    try {

        if (!email || !password) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        
        const result = await loginService.generateAccessToken(sql, emailToSearch, password)


        const data = {
            access_token: result.generateAccessToken,
            refresh_token: result.generateRefreshToken,
        }


        res.status(201).json({ status: "OK", data: data });



    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/login :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}