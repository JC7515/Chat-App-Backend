import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { SECRET_KEY_JWT } from '../../configEnv.js'
import fs from 'fs'
import { CreateSessionOutputFilterSensitiveLog } from '@aws-sdk/client-s3'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../const/index.js'
import connection from '../../connectionDb.cjs'
import { v4 as uuidv4 } from 'uuid'

const SECRETKEY = SECRET_KEY_JWT


/**
 * The function `getUserId` extracts the user ID and profile picture from a JWT token in a request
 * object.
 * @param request - The `request` parameter is an object that represents the HTTP request made to the
 * server. It typically contains information such as headers, body, and query parameters. In this case,
 * the `request` object is used to extract the authorization token.
 * @returns The function `getUserId` returns an object with the properties `userId` and
 * `profile_picture`.
 */
export const GetDataOfToken = (request) => {
    // const header = request.authorization

    if (request) {
        const token = request.replace('Bearer ', '')
        const { userId, tokenrole } = jwt.verify(token, SECRETKEY)
        return { userId, tokenrole }
    }

    throw { status: 500, message: 'Autorization required' }
}



/**
 * The function `hashPassword` takes a password as input, checks if it has at least 7 characters,
 * generates a salt using bcrypt, and then hashes the password using the salt.
 * @param password - The `password` parameter is the password that needs to be hashed.
 * @returns a promise that resolves to the hashed password if the password length is greater than or
 * equal to 7 characters. If the password length is less than 7 characters, it throws an error with the
 * message "La contraseña debe tener 7 caracteres a mas". If there is an error during the hashing
 * process, it returns a new Error object with the message "Cant encrypt the password
 */
export const HashPassword = async (password) => {
    try {
        if (password.length < 7) {
            throw { message: 'La contraseña debe tener 7 caracteres a mas' }
        }

        const salt = await bcrypt.genSalt(10)

        return await bcrypt.hash(password, salt)
    } catch (err) {
        throw { status: 500, message: err.message || 'Cant encrypt the password' }
    }
}


/**
 * The function `comparatePassword` compares a request password with a stored password using bcrypt.
 * @param requestPassword - The `requestPassword` parameter is the password that is being requested or
 * entered by the user. It is the password that needs to be compared with the stored password.
 * @param password - The `password` parameter is the stored password that you want to compare with the
 * `requestPassword`.
 * @returns The function `comparatePassword` returns a promise that resolves to a boolean value
 * indicating whether the `requestPassword` matches the `password` after being compared using bcrypt's
 * `compare` method. If there is an error during the comparison, it returns a new Error object with the
 * message 'Cant compare passwords'.
 */
export const ComparatePassword = async (requestPassword, password) => {
    try {
        return await bcrypt.compare(requestPassword, password)
    } catch (err) {
        throw { status: 500, message: 'Cant compare passwords' }
    }
}



export const GenerateAccessToken = (userId, tokenrole = ACCESS_TOKEN_NAME) => {
    return jwt.sign({ userId, tokenrole }, SECRETKEY, { expiresIn: '1 days' })
}

export const GenerateRefreshToken = (userId, tokenrole = REFRESH_TOKEN_NAME) => {
    return jwt.sign({ userId, tokenrole }, SECRETKEY, { expiresIn: '1 days' })
}


export const GenerateTokenToValidateUserMail = (userId) => {
    return jwt.sign({ userId }, SECRETKEY, { expiresIn: '3 days' })
}




export const ChangeNameOfProfileImage = async (originalRouteofImage, newRouteOfImage) => {
    // originalurlofImage : aqui necesitas poner la ruta origina de tu archivo. en donde tambien estar su nombre actual
    // newUrlOfImage: y aqui la nueva ruta que tiene que ser la misma que la original, pero con el nuevo nombre que desea ponerle al archivo, recuerda que este proceso no afecta la resolucion de la imagen
    try {

        await fs.promises.rename(originalRouteofImage, newRouteOfImage)

        console.log(`Nombre de archivo cambiado con éxito, nuevo ruta de archibo: ${newRouteOfImage}`);

        return

    } catch {
        throw { status: 500, message: err }
    }

}


// Esta funcion sirve tanto para obtener la lista de integrantes de un chat de tipo grupo y uno de contacto de dos personas  

export const GetListMembersOfChat = async (chatId, userId) => {
    try {

        const sql = 'SELECT * FROM chat_participants WHERE chat_id = $1'

        const dataForQuery = [chatId]

        const result = await connection.query(sql, dataForQuery)

        // console.log(chatId)
        // console.log(result.rows)

        if (result.rows.length === 0) {
            console.log(`hubo un problema al enviar el mensaje mensaje a los integrantes del chat en la funcion GetListMembersOfChat`)

            throw { status: 404, message: `There was a problem sending the message.` }
        }


        const listOfMembers = result.rows.filter((member) => member.user_id !== userId)

        // console.log(listOfMembers)


        return listOfMembers

    } catch (error) {
        return { status: "FAILED", data: { error: error?.message } }
    }
}




export const GetAllMembersFromAChat = async (chatId) => {
    try {

        const sql = 'SELECT * FROM Chat_participants WHERE chat_id = $1'


        const chatdataForQuery = [chatId]

        const result = await connection.query(sql, chatdataForQuery)

        if (result.rows.length === 0) {
            console.log(`hubo un problema al obtener los participantes del chat con id ${chat_id} en la funcion GetAllMembersFromAChat`)

            throw { status: 404, message: `There was a problem with the page, try reload please.` }
        }


        const data = {
            list
        }

        return { status: 'OK', }

    } catch (error) {
        return { status: "FAILED", data: { error: error?.message } }
    }
}




export const UpdateUserSocketId = async (userId, newSocketId) => {

    try {

        const sql = "UPDATE users SET socket_id = $1 WHERE user_id = $2"

        const dataForQuery = [newSocketId, userId]


        const resultsOfNameSearched = await connection.query(sql, dataForQuery)


        if (resultsOfNameSearched.rowCount === 0) {
            console.log('la propiedad rowCount indica que el no se actualizo la columna socketid del usuario con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // console.log(ListOfUserFounds)


        return { status: 'OK' }

    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        return { status: "FAILED", data: { error: error?.message } }
    }
}






export const CreateANewMessage = async (message) => {

    const sql = 'INSERT INTO messages(message_id, chat_id, user_id, message_content, timestamp, is_read, read_timestamp, message_type) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'


    try {


        const dataForQuery = [message.message_id,
        message.chat_id,
        message.user_id,
        message.message_content,
        message.timestamp,
        message.is_read,
        message.read_timestamp,
        message.message_type]


        const result = await connection.query(sql, dataForQuery)

        if (result.rowCount === 0) {
            console.log(`hubo un problema al registrar el mensaje en el chat con id ${message.chat_id} en la funcion CreateANewMessage`)

            throw { status: 404, message: `There was a problem to register the message.` }
        }


        console.log(`se registro un nuevo mensaje con id ${message.message_id}`)

        return { status: 'OK', message: `Message Register with the id ${message.message_id}` }

    } catch (error) {
        return { status: "FAILED", data: { error: error?.message } }
    }

}


export const CreateNewNotification = async (message_id, participant_id, chat_id, group_id, type, message, status) => {

    try {

        // // 1)
        // const sqlForValidateMessageId = 'SELECT * FROM messages WHERE message_id = $1'


        // 2)
        const sqlForCreateNotification = 'INSERT INTO notifications(notification_id, message_id, user_id, chat_id, group_id, type, message, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'


        // 3)
        const sqlForGetUserNotifications = 'SELECT * FROM notifications WHERE user_id = $1'


        // await new Promise(
        //     (resolve) => { resolve(setTimeout(() => { console.log('se ejecuto el settimeout ') }, 500)) }
        // )


        if (!message_id || !participant_id || !chat_id || !group_id || !type || !message || !status) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        // 1)
        // ************ Validamos que el message_id de la notificacion exista, para evitar errorres *************

        // const dataForGetMessageId = [message_id]

        // const resultOfFindMessage = await connection.query(sqlForValidateMessageId, dataForGetMessageId)

        // console.log(resultOfFindMessage.rows)


        // if (resultOfFindMessage.rows.length === 0) {
        //     console.log(`No se encontro el message con message_id: ${message_id}, por lo que se evito proceder con el registro de la notificacion`)

        //     throw { status: 500, message: `An error occurred, try again` }
        // }

        // 2)
        // ************ Creacion de chat *************
        const notification_id = uuidv4()

        const chatDataForRegister = [notification_id, message_id, participant_id, chat_id, group_id, type, message, status]

        const resultNotificationCreation = await connection.query(sqlForCreateNotification, chatDataForRegister)


        if(resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 3)
        // ************ Obtener todas las notificaciones del usurario *************

        const dataForGetNotifications = [participant_id]

        const resultOfGetUserNotifications = await connection.query(sqlForGetUserNotifications, dataForGetNotifications)


        const userNotificationsObtained = resultOfGetUserNotifications.rows

        console.log(userNotificationsObtained)

        const data = {
            user_notifications: userNotificationsObtained
        }


        return { status: "OK", data }

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /notifications:', error);

        return { status: "FAILED", data: { error: error?.message } }
    }


}