import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { SECRET_KEY_JWT } from '../../configEnv.js'
import fs from 'fs'
import { CreateSessionOutputFilterSensitiveLog } from '@aws-sdk/client-s3'
import { ACCESS_TOKEN_NAME, EMAIL_VALIDATION_TOKEN, REFRESH_TOKEN_NAME } from '../const/index.js'
import connection from '../../connectionDb.cjs'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

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
    try {

        if (request) {
            const token = request.replace('Bearer ', '')
            const { userId, tokenrole } = jwt.verify(token, SECRETKEY)
            return { userId, tokenrole }
        }

        throw { status: 500, message: 'Autorization required'}

    } catch (err) {
        throw { status: 500, message: err.message || 'Cant verify the token' }
    }
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


export const GenerateTokenToValidateUserMail = (userId, tokenrole = EMAIL_VALIDATION_TOKEN) => {
    return jwt.sign({ userId, tokenrole }, SECRETKEY, { expiresIn: '3 days' })
}



export const GenerateNewFileNameOfProfile = (newFileName, originalFileName) => {
    const CreateNewFileName = `${newFileName}${path.extname(originalFileName)}`

    return CreateNewFileName
}


export const GenerateSqlToUpdateProfileData = (frontData, dbFields) => {

    const dinamicStringData = []

    // aqui estamos filtrando el array de datos que nos llega del front, validando solo los datos que no sean undefined y agregando al arr dinamicStringData el string con el numbre del field a actualizar en la base de datos y su indice de posicion      
    let currentIndex = 0

    frontData.forEach((field, index) => {
        if (field) {
            currentIndex = currentIndex + 1
            dinamicStringData.push(`${dbFields[index]} = $${currentIndex}`)
        }
    })


    // aqui filtramos y obtenemos solo los fields que van a ser modificados en la base de datos 
    const fieldsToUpdate = dinamicStringData.filter((field, index) => index !== dinamicStringData.length - 1)

    // aqui estamos obteniendo la ultima posicion del array dinamicStringData para obtener el field de filtrado para la consulta, en este caso siempre sera por user_id 
    const lastIndex = dinamicStringData.length - 1

    // aqui creamos la consulta dinamica para luego devolverla
    let dinamicSqlToReturn = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE ${dinamicStringData[lastIndex]}`

    let dinamicSql = dinamicSqlToReturn.replace(/`/g, "'")
    dinamicSqlToReturn = dinamicSql

    return dinamicSqlToReturn

}


export const ChangeNameOfImageFile = async (originalRouteofImage, newRouteOfImage) => {
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


export const CreateNewNotificationForGroup = async (notification) => {

    try {

        // // 1)
        // const sqlForValidateMessageId = 'SELECT * FROM messages WHERE message_id = $1'


        // 2)
        const sqlForCreateNotification = 'INSERT INTO notifications(notification_id, message_id, user_id, chat_id, group_id, type, chat_type, message, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)'


        // 3)
        const sqlForGetUserNotifications = 'SELECT * FROM notifications WHERE user_id = $1 AND chat_type = $2'


        // await new Promise(
        //     (resolve) => { resolve(setTimeout(() => { console.log('se ejecuto el settimeout ') }, 500)) }
        // )


        if (!notification.message_id || !notification.participant_id || !notification.chat_id || !notification.group_id || !notification.type || !notification.chat_type || !notification.message || !notification.status) {
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

        const chatDataForRegister = [notification_id, notification.message_id, notification.participant_id, notification.chat_id, notification.group_id, notification.type, notification.chat_type, notification.message, notification.status]

        const resultNotificationCreation = await connection.query(sqlForCreateNotification, chatDataForRegister)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 3)
        // ************ Obtener todas las notificaciones del usurario *************

        const dataForGetNotifications = [notification.participant_id, notification.chat_type]

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



export const CreateNewNotificationForContact = async (notification) => {

    try {

        // // 1)
        // const sqlForValidateMessageId = 'SELECT * FROM messages WHERE message_id = $1'


        // 2)
        const sqlForCreateNotification = 'INSERT INTO notifications(notification_id, message_id, user_id, chat_id, type, chat_type, message, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'


        // 3)
        const sqlForGetUserNotifications = 'SELECT * FROM notifications WHERE user_id = $1 AND chat_type = $2'


        // await new Promise(
        //     (resolve) => { resolve(setTimeout(() => { console.log('se ejecuto el settimeout ') }, 500)) }
        // )


        if (!notification.message_id || !notification.participant_id || !notification.chat_id || !notification.type || !notification.chat_type || !notification.message || !notification.status) {
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

        const chatDataForRegister = [notification_id, notification.message_id, notification.participant_id, notification.chat_id, notification.type, notification.chat_type, notification.message, notification.status]

        const resultNotificationCreation = await connection.query(sqlForCreateNotification, chatDataForRegister)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 3)
        // ************ Obtener todas las notificaciones del usurario *************

        const dataForGetNotifications = [notification.participant_id, notification.chat_type]

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


export const UpdateSocketIdOfUser = async (newSocketId, lastSocketId) => {

    const sqlToGetUserData = 'SELECT user_id, socket_id FROM users WHERE socket_id = $1'

    const sqlTOUpdateSocketId = "UPDATE users SET socket_id = $1 WHERE user_id = $2"


    try {


        if (!newSocketId) {
            console.log('faltaron datos en el envio de la peticion PUT /users/socketId')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }



        // 1)
        // ************ Obtencion de los datos del usuario *************


        const dataForGetUserId = [lastSocketId]


        const resultsOfGetUserData = await connection.query(sqlToGetUserData, dataForGetUserId)

        const userDataObtained = resultsOfGetUserData.rows[0]


        console.log(userDataObtained)


        if (userDataObtained.length === 0) {
            console.log('la propiedad length indica que no ah obtenido ningun usuario con exito ')
            throw { status: 500, message: `An error occurred, try again` }
        }


        // 2)
        // ************ Actualizacion de socket id *************

        const dataForUpdateSocketId = [newSocketId, userDataObtained.user_id]


        const resultsOfUpdateUserData = await connection.query(sqlTOUpdateSocketId, dataForUpdateSocketId)


        if (resultsOfUpdateUserData.rowCount === 0) {
            console.log('la propiedad rowCount indica que el no se actualizo la columna socketid del usuario con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // console.log(ListOfUserFounds)


        return { status: "OK" }

    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        return { status: "FAILED", data: { error: error?.message } }
    }

}



export const UpdateChatParticipantStatus = async (socketId) => {

    // 1) 
    const sqlToGetUserData = 'SELECT user_id FROM users WHERE socket_id = $1'

    // 2)
    const sqlToGetChatParticipantData = 'SELECT chat_id FROM chat_participants WHERE user_id = $1 AND status = $2'

    // 3)  
    const sqlToUpdateChatParticipantStatus = 'UPDATE chat_participants SET status = $1 WHERE user_id = $2 AND chat_id = $3'



    // ***********************


    // 4)
    const sqlTOGetUserContacts = 'SELECT user_id, contact_user_id, chat_id FROM contacts WHERE user_id = $1'

    // 5)
    const sqlToGetContactSocketId = 'SELECT user_id, socket_id FROM users WHERE user_id = $1'



    try {


        if (!socketId) {
            console.log('faltaron datos en el envio de lA funcion UpdateChatParticipantStatus')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }



        // 1)
        // ************ Obtencion de los datos del usuario por socketId *************


        const dataForGetUserId = [socketId]


        const resultsOfGetUserData = await connection.query(sqlToGetUserData, dataForGetUserId)

        const userDataObtained = resultsOfGetUserData.rows[0]


        console.log(userDataObtained)


        if (resultsOfGetUserData.rows.length === 0) {
            console.log('la propiedad length indica que no ah obtenido ningun usuario con exito ')
            throw { status: 500, message: `An error occurred, try again` }
        }


        // 2)
        // ************ Validacion y obtencion del chat_id en el que se encuentra en el usuario antes de desconexion *************

        const statusValueToFind = "active"

        const dataForGetChatId = [userDataObtained.user_id, statusValueToFind]


        const resultsOfGetChatId = await connection.query(sqlToGetChatParticipantData, dataForGetChatId)


        const chatIdObtained = resultsOfGetChatId.rows[0]

        console.log(chatIdObtained)

        // if (resultsOfGetChatId.rows.length === 0) {
        //     console.log('la propiedad length indica que no ah obtenido ningun chatId con exito ')
        //     throw { status: 500, message: `An error occurred, try again` }
        // }


        // Aqui actualizamos el estatus de partcipante en el chat, siempre que exista un chat id en el que el usuario este conectado
        if (chatIdObtained !== undefined) {

            // 3)
            // ************ Aqui actualizamos el estatus de partcipante en el chat *************

            const newStatus = "inactive"

            const dataForUpdateChatParticipantStatus = [newStatus, userDataObtained.user_id, chatIdObtained.chat_id]


            const resultsOfUpdateStatus = await connection.query(sqlToUpdateChatParticipantStatus, dataForUpdateChatParticipantStatus)



            if (resultsOfUpdateStatus.rowCount === 0) {
                console.log('la propiedad length indica que no ah se ah actualizado ningun status de participante de chat con exito ')
                throw { status: 500, message: `An error occurred, try again` }
            }


        }


        // 4)
        // ************ Obtencion de la lista de contactos del usuario a punto de ser desconectado *************


        const dataForGetConctacList = [userDataObtained.user_id]


        const resultsOfGetContactList = await connection.query(sqlTOGetUserContacts, dataForGetConctacList)


        const contactsListObtained = resultsOfGetContactList.rows


        // if (contactsListObtained.length === 0) {
        //     console.log('la propiedad length indica que no ah obtenido ningun contacto con exito ')
        //     throw { status: 500, message: `An error occurred, try again` }
        // }



        // 5)
        // ************ Mapeo de la data de los contactos con el socket_id del contacto *************

        let contactList = undefined

        if (contactsListObtained.length > 0) {

            contactList = await Promise.all(
                contactsListObtained.map(async (contact) => {

                    const dataForGetContactSocketId = [contact.contact_user_id]

                    const resultsOfGetContactSocketId = await connection.query(sqlToGetContactSocketId, dataForGetContactSocketId)

                    const contactSocketIdObtained = resultsOfGetContactSocketId.rows[0]

                    const objetToReturn = {
                        user_id: contact.user_id,
                        chat_id: contact.chat_id,
                        contact_user: contactSocketIdObtained
                    }


                    // if (contactsListObtained.length === 0) {
                    //     console.log('la propiedad length indica que no ah obtenido ningun contacto con exito ')
                    //     throw { status: 500, message: `An error occurred, try again` }
                    // }


                    return objetToReturn

                })
            )
        }


        console.log(contactList)
        const chatIdValue = !chatIdObtained ? 'empty' : chatIdObtained.chat_id


        const data = {
            chatId: chatIdValue,
            contactList: contactList
        }

        return { status: "OK", data: data }

    } catch (error) {
        console.error('Se produjo un error en la funcion UpdateChatParticipantStatus ', error);

        return { status: "FAILED", data: { error: error?.message } }
    }

}



export const GetContactListOfUser = async (userId) => {


    // 1)
    const sqlToGetUserContacts = 'SELECT user_id, contact_user_id, chat_id FROM contacts WHERE user_id = $1'

    // 2)
    const sqlToGetContactSocketId = 'SELECT user_id, socket_id FROM users WHERE user_id = $1'



    try {


        if (!userId) {
            console.log('faltaron datos en el envio de lA funcion UpdateChatParticipantStatus')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }


        // 4)
        // ************ Obtencion de la lista de contactos del usuario a punto de ser desconectado *************


        const dataForGetConctacList = [userId]


        const resultsOfGetContactList = await connection.query(sqlToGetUserContacts, dataForGetConctacList)


        const contactsListObtained = resultsOfGetContactList.rows


        // if (contactsListObtained.length === 0) {
        //     console.log('la propiedad length indica que no ah obtenido ningun contacto con exito ')
        //     throw { status: 500, message: `An error occurred, try again` }
        // }



        // 5)
        // ************ Mapeo de la data de los contactos con el socket_id del contacto *************

        let contactList = undefined

        if (contactsListObtained.length > 0) {

            contactList = await Promise.all(
                contactsListObtained.map(async (contact) => {

                    const dataForGetContactSocketId = [contact.contact_user_id]

                    const resultsOfGetContactSocketId = await connection.query(sqlToGetContactSocketId, dataForGetContactSocketId)

                    const contactSocketIdObtained = resultsOfGetContactSocketId.rows[0]

                    const objetToReturn = {
                        user_id: contact.user_id,
                        chat_id: contact.chat_id,
                        contact_user: { ...contactSocketIdObtained }
                    }


                    // if (contactsListObtained.length === 0) {
                    //     console.log('la propiedad length indica que no ah obtenido ningun contacto con exito ')
                    //     throw { status: 500, message: `An error occurred, try again` }
                    // }


                    return objetToReturn

                })
            )
        }


        console.log(contactList)

        const data = {
            contactList: contactList
        }

        return { status: "OK", data: data }

    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        return { status: "FAILED", data: { error: error?.message } }
    }

}
