import express from "express";
import connection from "../../connectionDb.cjs";
import { ComparatePassword, GenerateAccessToken, GenerateRefreshToken } from "../utils/index.js";
const router = express.Router()


router.post('/auth/login', async (req, res) => {

    const { email, password } = req.body
    // console.log(email, password)

    const sql = 'SELECT * FROM users WHERE email = $1'

    const emailToSearch = [email]

    try {

        if (!email || !password) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        const result = await connection.query(sql, emailToSearch)


        if (result.rows.length === 0) {
            console.log(`User Not Found`)
            throw { status: 400, message: `Please enter a valid email.` }
        }


        // IMPORTANTE: ya no se hace un bucle, porque previamente se hizo una validacion usersRouters para validad que el email de cada usuario sea unico en la db, por lo que aca la consulta nos estaria devolviendo un solo usuario, ya no un grupo 

        const userData = result.rows[0]

        const isTheCorrectPassword = await ComparatePassword(password, userData.password)

        // console.log(isTheCorrectPassword)

        if (!isTheCorrectPassword) throw { status: 401, message: 'Incorrect email or password. Please try again.' }


        const generateAccessToken = GenerateAccessToken(userData.user_id)

        const generateRefreshToken = GenerateRefreshToken(userData.user_id)

        const data = {
            access_token: generateAccessToken,
            refresh_token: generateRefreshToken,
        }


        res.status(201).json({ status: "OK", data: data });



    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/login :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

})


export default router