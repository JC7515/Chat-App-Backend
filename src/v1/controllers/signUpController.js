import { GenerateTokenToValidateUserMail, HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import connection from "../../connectionDb.cjs";
import { SendEmailValidation } from "../../resend.js";


export const saveNewRegisteredUser = async (req, res) => {
    const { username,
        verifyPassword,
        password,
        name,
        biography,
        birth_day,
        phone,
        email,
        create_at } = req.body


    console.log(username)

    const sql = 'INSERT INTO users(user_id, socket_id,username, password, name, biography, birth_day, phone, email, profile_picture, create_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)'

    try {

        if (!username || !password || !verifyPassword || !name || !birth_day || !phone || !email || !create_at) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        if (password.length < 8) {
            throw { status: 400, message: `The password must be at least 8 characters and contain letters and numbers` }
        }


        if(password !== verifyPassword){
            throw { status: 400, message: `Passwords do not match` }
        }


        const user_id = uuidv4()
        const socketIdDefaultValue = 'empty'

        const encryptedPassword = await HashPassword(password)

        const userDataForRegister = [user_id, socketIdDefaultValue, username, encryptedPassword, name, biography, birth_day, phone, email, 'image-default-avatar-profile-0.png', create_at]

        console.log(userDataForRegister)

        // const userDataForRegister = [id, name, encryptedPassword, email, 'image-basic-avatar-profile.png', date, create_at]

        // await singUpService.SignUp( sql, userDataForRegister, id)


        if (!userDataForRegister[2]) {
            console.log(`The encrypted password does not exist`)
            throw { status: 404, message: `An error occurred, try again` }
        }


        const result = await connection.query(sql, userDataForRegister)

        if (result.rowCount === 0) {
            console.log('la propiedad rowCount indica que no hay registros insertados con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // const tokenForValidateEmail = GenerateTokenToValidateUserMail(user_id)

        // console.log(tokenForValidateEmail)

        // const validationUrl = `http://localhost:3000/emailVerification/${tokenForValidateEmail}`

        // // const sendEmailValidation = await SendEmailValidation(email, validationUrl)

        // await SendEmailValidation(email, validationUrl)


        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint /SignUp :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}