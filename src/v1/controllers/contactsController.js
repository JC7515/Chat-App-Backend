import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString, GetTwoGroupInicials, TransformDateToCorrectFormatString } from "../helpers/index.js";
import { GetFileUrl } from "../../s3.js";


export const getContacts = async (req, res) => {

    const { userId } = req.user
    const { chatId, contactUserId } = req.query


    // console.log(userId)

    try {


        // )
        const sql = 'SELECT * FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'
        const ContactData = [userId, contactUserId, chatId]


        const resultOfGetUserContacts = await connection.query(sql, ContactData)


        const contactChatData = resultOfGetUserContacts.rows




        // aqui mapeamos los datos para devolver un objeto con la misma estructura de un objeto contacts, pero cambiando la propiedad contact_user_id por user y otorgandole los datos del usuario obtenido a la propiedad user

        // ******************NOTA*******************
        // aqui dejamos la logica del map, porque como el resultado que nos devuelve el query solo es un elemento, el map se ejecutara una sola vez, cumpliendo su funcion si tener que modificarlo  

        const contactsListOfUser = await Promise.all(
            contactChatData.map(async (contact, index) => {
                try {

                    // 1)
                    const sql = 'SELECT user_id, socket_id, username, profile_picture FROM users WHERE user_id = $1'

                    // 2)
                    const sqlForGetParticipantStatus = 'SELECT * FROM chat_participants WHERE user_id = $1 AND chat_id = $2'


                    // 3)
                    const sqlForGetBlocksOfUser = 'SELECT * FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'

                    // 4)
                    const sqlForGetBlocksOfContact = 'SELECT * FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'


                    // 1) **************************
                    const contactDataForSql = [contact.contact_user_id]

                    // aqui estamos extrayendo todos los datos del contacto 
                    const GetContactData = await connection.query(sql, contactDataForSql)

                    // 2) ***************************
                    // aqui estamos extrayendo el status de la tabla chat_participants del contacto 

                    const contactDataForGetStatus = [contact.contact_user_id, contact.chat_id]

                    const GetParticipantStatus = await connection.query(sqlForGetParticipantStatus, contactDataForGetStatus)

                    // 3) ***************************
                    // aqui estamos obteniendo el ultimo block registrado del usuario, para otorgarle a la propiedad isBlocked falso si el status es inactive o true si es active    
                    const dataForGetBlocksOfUser = [userId, contact.contact_user_id, contact.chat_id]

                    const resultOfGetUserBlocksList = await connection.query(sqlForGetBlocksOfUser, dataForGetBlocksOfUser)

                    const userBlocksList = resultOfGetUserBlocksList.rows

                    // 4) ***************************
                    // aqui estamos Obteniendo el ultimo block que hizo el contacto a nuestro usuario y si es que este esta activbo   
                    const dataForGetBlocksOfContact = [contact.contact_user_id, userId, contact.chat_id]

                    const resultOfGetContactBlocksList = await connection.query(sqlForGetBlocksOfContact, dataForGetBlocksOfContact)

                    const ContactblocksList = resultOfGetContactBlocksList.rows

                    // *******************************

                    const resultOfGetContactData = GetContactData.rows[0]

                    const resultOfGetParticipantStatus = GetParticipantStatus.rows[0]




                    // Aqui estamos generando una url prefirmada para la imagen de perfil de nuestro usuario
                    let profilePictureUrl = '/'

                    if (resultOfGetContactData.profile_picture) {

                        profilePictureUrl = await GetFileUrl(resultOfGetContactData.profile_picture, 88000)
                        console.log(profilePictureUrl)

                    }

                    // aqui estamos obteniendo las dos primera siglas del nombre del usuario para pobnerlo como icono en la vista en caso de que su foto de perfil no se visualize
                    const contactIconValue = GetTwoGroupInicials(resultOfGetContactData.username)


                    // *******aqui validamos si el contacto bloqueo al usuario, para que en la vista no se muestre la foto de usuario al contacto y mas informacion de importacion, si es que el contacto bloqueo a el usuario ********* 

                    let isUserBlockedForContact = false

                    // aqui validamos si es que resultOfGetParticipantStatus.status exite, ya que el contacto podria haberse eliminido y el valor del status puede ser undefined 
                    let contactStatus = 'inactive'

                    if (resultOfGetParticipantStatus) {
                        contactStatus = resultOfGetParticipantStatus.status
                    }


                    if (ContactblocksList.length > 0) {
                        isUserBlockedForContact = ContactblocksList[ContactblocksList.length - 1].status === 'active' ? true : false
                    }


                    const contactDataObtained = {
                        ...resultOfGetContactData,
                        socket_id: resultOfGetContactData.socket_id,
                        profile_picture: profilePictureUrl,
                        contact_icon: contactIconValue, status: contactStatus,
                        contact_blocked_you: isUserBlockedForContact
                    }


                    // /* ********* Aqui validamos el ultimo bloquo que hizo el usuario a este contacto y si el bloqueo es active o inactive *********** */

                    // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
                    const isContactValidatedForUser = userBlocksList.length > 0 ? true : false

                    const isContactBlockedForUser = isContactValidatedForUser && userBlocksList[userBlocksList.length - 1].status === 'active' ? true : false

                    // aqui estamos transformando la fecha de creacion de los contactos a un formato string 
                    const creationDateOfContact = TransformDateToCorrectFormatString(contact.creation_date)

                    return {
                        contact_id: contact.contact_id,
                        contact_user: contactDataObtained,
                        chat_id: contact.chat_id,
                        is_blocked: isContactBlockedForUser,
                        is_contact_validated: isContactValidatedForUser,
                        creation_date: creationDateOfContact
                    }


                } catch (error) {
                    console.log(error)
                }
            })

        )

        const data = {
            contact_data: contactsListOfUser[0]
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}




export const getContactList = async (req, res) => {

    const { userId } = req.user

    // console.log(userId)

    try {


        // )
        const sql = 'SELECT * FROM contacts WHERE user_id = $1'
        const userData = [userId]


        const resultOfGetUserContacts = await connection.query(sql, userData)


        const contactsList = resultOfGetUserContacts.rows


        console.log(contactsList)

        // aqui mapeamos los datos para devolver un objeto con la misma estructura de un objeto contacts, pero cambiando la propiedad contact_user_id por user y otorgandole los datos del usuario obtenido a la propiedad user   

        const contactsListOfUser = await Promise.all(
            contactsList.map(async (contact, index) => {
                try {

                    // 1)
                    const sql = 'SELECT user_id, socket_id, username, profile_picture FROM users WHERE user_id = $1'



                    // 2)
                    const sqlForGetParticipantStatus = 'SELECT * FROM chat_participants WHERE user_id = $1 AND chat_id = $2'


                    // 3)
                    const sqlForGetBlocksOfUser = 'SELECT * FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'

                    // 4)
                    const sqlForGetBlocksOfContact = 'SELECT * FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'



                    // 1) **************************
                    const contactDataForSql = [contact.contact_user_id]

                    // aqui estamos extrayendo todos los datos del contacto 
                    const GetContactData = await connection.query(sql, contactDataForSql)

                    // 2) ***************************
                    // aqui estamos extrayendo el status de la tabla chat_participants del contacto 

                    const contactDataForGetStatus = [contact.contact_user_id, contact.chat_id]

                    const GetParticipantStatus = await connection.query(sqlForGetParticipantStatus, contactDataForGetStatus)

                    // 3) ***************************
                    // aqui estamos obteniendo el ultimo block registrado del usuario, para otorgarle a la propiedad isBlocked falso si el status es inactive o true si es active    
                    const dataForGetBlocksOfUser = [userId, contact.contact_user_id, contact.chat_id]

                    const resultOfGetUserBlocksList = await connection.query(sqlForGetBlocksOfUser, dataForGetBlocksOfUser)

                    const userBlocksList = resultOfGetUserBlocksList.rows


                    // 4) ***************************
                    // aqui estamos Obteniendo el ultimo block que hizo el contacto a nuestro usuario y si es que este esta activbo   
                    const dataForGetBlocksOfContact = [contact.contact_user_id, userId, contact.chat_id]

                    const resultOfGetContactBlocksList = await connection.query(sqlForGetBlocksOfContact, dataForGetBlocksOfContact)

                    const ContactblocksList = resultOfGetContactBlocksList.rows


                    // *******************************

                    const resultOfGetContactData = GetContactData.rows[0]

                    const resultOfGetParticipantStatus = GetParticipantStatus.rows[0]




                    // Aqui estamos generando una url prefirmada para la imagen de perfil de nuestro usuario
                    let profilePictureUrl = '/'

                    if (resultOfGetContactData.profile_picture) {

                        profilePictureUrl = await GetFileUrl(resultOfGetContactData.profile_picture, 88000)
                        console.log(profilePictureUrl)

                    }

                    // aqui estamos obteniendo las dos primera siglas del nombre del usuario para pobnerlo como icono en la vista en caso de que su foto de perfil no se visualize
                    const contactIconValue = GetTwoGroupInicials(resultOfGetContactData.username)



                    // ******aqui validamos si el contacto bloqueo al usuario, para que en la vista no se muestre la foto de usuario al contacto y mas informacion de importacion, si es que el contacto bloqueo a el usuario******
                    let isUserBlockedForContact = false

                    // aqui validamos si es que resultOfGetParticipantStatus.status exite, ya que el contacto podria haberse eliminido y el valor del status puede ser undefined 
                    let contactStatus = 'inactive'

                    if (resultOfGetParticipantStatus) {
                        contactStatus = resultOfGetParticipantStatus.status
                    }


                    if (ContactblocksList.length > 0) {
                        isUserBlockedForContact = ContactblocksList[ContactblocksList.length - 1].status === 'active' ? true : false
                    }




                    const contactDataObtained = {
                        ...resultOfGetContactData, profile_picture: profilePictureUrl,
                        contact_icon: contactIconValue, status: contactStatus,
                        contact_blocked_you: isUserBlockedForContact
                    }


                    // /* ********* Aqui validamos el ultimo bloquo que hizo el usuario a este contacto y si el bloqueo es active o inactive *********** */

                    // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
                    const isContactValidatedForUser = userBlocksList.length > 0 ? true : false

                    const isContactBlockedForUser = isContactValidatedForUser && userBlocksList[userBlocksList.length - 1].status === 'active' ? true : false

                    // aqui estamos transformando la fecha de creacion de los contactos a un formato string 
                    const creationDateOfContact = TransformDateToCorrectFormatString(contact.creation_date)

                    return {
                        contact_id: contact.contact_id,
                        contact_user: contactDataObtained,
                        chat_id: contact.chat_id,
                        is_blocked: isContactBlockedForUser,
                        is_contact_validated: isContactValidatedForUser,
                        creation_date: creationDateOfContact
                    }


                } catch (error) {
                    console.log(error)
                }
            })

        )

        console.log(contactsListOfUser)

        const data = {
            contacts_list: contactsListOfUser
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const saveContact = async (req, res) => {



    const { userId } = req.user
    const { contact_user_id } = req.body

    // A)*******************************************
    // *********** Aqui Comprobamos que el usuario que este agregando al contacto no tenga un chat ya creado con ese contacto anteriormente y que este contacto no haya eliminado el chat definitivamente ************

    // aqui validamos si ahi un chat ya exitente, en donde el contacto ya tenga agregado al usuario, para asi evitar crear un chat nuevo y solo unir al usuario al chat exiten que ya tiene con el contacto
    // 0)
    const sqlForGetExistingContact = 'SELECT * FROM contacts WHERE user_id = $1 AND contact_user_id = $2'


    // 1)
    const sqlForRegisterUsersToChat = 'INSERT INTO chat_participants(chat_id, user_id, status, union_date) VALUES($1, $2, $3, $4)'

    // 2)
    const sqlForResgisterNewContact = 'INSERT INTO contacts(contact_id , user_id, contact_user_id, chat_id, creation_date) VALUES($1, $2, $3, $4, $5)'


    // 3)
    const sqlForResgisterNewBlockInactive = 'INSERT INTO blocks( block_id, blocker_user_id, blocked_user_id, block_date, chat_id, status) VALUES($1, $2, $3, $4, $5, $6)'




    // B)*******************************************
    // *********** Aqui si el caso A ya se valido que no es valido, entonces crearemos un nuevo chat, dos registros de contacto y de participante para este chat, y blocks inactive para cada uno  ************


    // 1)
    const sqlForCreateChat = 'INSERT INTO chats(chat_id, name, type, last_update) VALUES($1, $2, $3, $4)'

    // Estas queryes estan comentadas por que tienen la misma estructura en el grupo A de arriba, por lo que no es necesario tenerlas activas, solo sirven para orientacion 

    // // 2)
    // const sqlForRegisterUsersToChat = 'INSERT INTO chat_participants(chat_id, user_id, status, union_date) VALUES($1, $2, $3, $4)'

    // // 3)
    // const sqlForResgisterNewContact = 'INSERT INTO contacts(contact_id , user_id, contact_user_id, chat_id, creation_date) VALUES($1, $2, $3, $4, $5)'



    // // 4)
    // const sqlForResgisterNewBlockInactive = 'INSERT INTO blocks( block_id, blocker_user_id, blocked_user_id, block_date, chat_id, status) VALUES($1, $2, $3, $4, $5, $6)'



    try {

        if (!userId || !contact_user_id) {
            console.log('faltaron datos en el envio de la peticion POST /contacts')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }



        // A)*******************************************
        // 0)
        // ************ Aqui validamos si ya exite un chat con el contacto que se desea agregar, con el contacto como usuario y el usuario como contacto *************

        const dataForSearchContact = [contact_user_id, userId]

        const resultToSearchContact = await connection.query(sqlForGetExistingContact, dataForSearchContact)



        const contactObtained = resultToSearchContact.rows[0]


        if (resultToSearchContact.rows.length === 1) {

            // 1)
            // ************ aqui registramos al usuario como participante del chat ya exitente *************

            const userData = userId
            const unionDate = GetCurrentDateString()


            const dataForRegisterChat = [contactObtained.chat_id, userData, 'inactive', unionDate]

            const resultOfUserRegisterInChat = await connection.query(sqlForRegisterUsersToChat, dataForRegisterChat)

            if (resultOfUserRegisterInChat.rowCount === 0) {
                console.log('la propiedad rowCount indica que nos se registro los participantes del chat al chat con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // 2)
            // ************ aqui creamos un nuevo contacto y lo enlazamos con el chat ya exitente *************

            const contact_id = uuidv4()
            const creation_date = GetCurrentDateString()

            const dataForRegisterContact = [contact_id, userId, contact_user_id, contactObtained.chat_id, creation_date]


            const resultOfContactsCreation = await connection.query(sqlForResgisterNewContact, dataForRegisterContact)


            if (resultOfContactsCreation.rowCount === 0) {
                console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // *****************************************

            // ADVERTENCIA: Aqui ya no creamos ningun nuevo block inactive al usuario, por que cuando este se elimina de la tabla de contacts, su historial de blocks permenece intacto, y si este deja en block active al contacto que elimino cuando lo vuelva a agregar este seguira con el bloqueo activo hacia ese contacto, por lo que tendra que desbloquearlo manualmente si asi lo quiere el usuario
            // // 3)
            // // ************ aqui creamos un nuevo block inactive para el contacto recien creado *************

            // // este es el id de bloqueo inactivo para el usuario que mando el mensaje
            // const block_id = uuidv4()
            // const blockStatus = 'inactive'
            // const blockDate = contactObtained.creation_date

            // const dataForRegisterBlock = [block_id, userId, contact_user_id, blockDate, contactObtained.chat_id, blockStatus]


            // const resultOfBlocksCreation = await connection.query(sqlForResgisterNewBlockInactive, dataForRegisterBlock)


            // if (resultOfBlocksCreation.rowCount === 0) {
            //     console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
            //     throw { status: 500, message: `An error occurred, try again` }
            // }

            // **********************************************

        } else {

            // B)*******************************************


            // 1)
            // ************ Creacion de chat *************
            const chat_id = uuidv4()
            const name = `name${userId, contact_user_id}`
            const chat_type = 'contact'
            const creationDate = GetCurrentDateString()



            const chatDataForRegister = [chat_id, name, chat_type, creationDate]

            const resultChatCreation = await connection.query(sqlForCreateChat, chatDataForRegister)


            if (resultChatCreation.rowCount === 0) {
                console.log('la propiedad rowCount indica que el chat no se creo con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // 2)
            // ******** creacion de participantes de chat ***********

            const listOfUsers = [{ id: userId }, { id: contact_user_id }]
            const unionDate = GetCurrentDateString()

            listOfUsers.forEach(async (participant) => {

                const adminDataForChatRegister = [chat_id, participant.id, 'inactive', unionDate]

                const resultOfUserRegisterInChat = await connection.query(sqlForRegisterUsersToChat, adminDataForChatRegister)

                if (resultOfUserRegisterInChat.rowCount === 0) {
                    console.log('la propiedad rowCount indica que nos se registro los participantes del chat al chat con exito')
                    throw { status: 500, message: `An error occurred, try again` }
                }

            })


            // 3)
            // ************ Creacion de nuevo contacto *************   



            // este es el id de contacto para el usuario que mando el mensaje
            const contact_id_one = uuidv4()
            // este es el id de contacto para el usuario que recibio el mensaje 
            const contact_id_two = uuidv4()
            const creation_date = GetCurrentDateString()

            const DataForRegisterContacts = [[contact_id_one, userId, contact_user_id, chat_id, creation_date], [contact_id_two, contact_user_id, userId, chat_id, creation_date]]

            DataForRegisterContacts.forEach(async (dataForCreateContact, index) => {

                const dataForQuery = DataForRegisterContacts[index]
                console.log(dataForQuery)

                const resultOfContactsCreation = await connection.query(sqlForResgisterNewContact, dataForQuery)


                if (resultOfContactsCreation.rowCount === 0) {
                    console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
                    throw { status: 500, message: `An error occurred, try again` }
                }

            })


            // 4)
            // ************ Creacion de registros de bloqueo inactivo para todos los participantes del chat de contacto *************  


            // este es el id de bloqueo inactivo para el usuario que mando el mensaje
            const block_id_one = uuidv4()
            const blockStatus = 'inactive'
            const blockDate = GetCurrentDateString()

            const DataForRegisterBlock = [block_id_one, userId, contact_user_id, blockDate, chat_id, blockStatus]


            const resultOfBlocksCreation = await connection.query(sqlForResgisterNewBlockInactive, DataForRegisterBlock)


            if (resultOfBlocksCreation.rowCount === 0) {
                console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }


        }




        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint /SignUp :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}



export const deleteContact =  async (req, res) => {

    const { userId } = req.user
    const { chatId, contactUserId } = req.query

    // console.log(invitation_id)



    // A)*******************************************
    // *********** Aqui Comprobamos que el usuario que este eliminando al contacto sea el ultimo activo en su chat, para eliminar el chat y todos los mensajes del chat, como los blocks y los registros de eliminacion del historial de mensajes ************

    // Este clausula sql nos sirve para obtener todos los participantes del chat activos y validar que sean menos de dos, para asi eliminar todos los mensajes, el chat, los block y los registros de elimininacion de historial de mensajes del chat, que aun quedan relacionado a ese chat de contacto     
    // 1)
    const sqlForGetAllChatParticipants = 'SELECT * FROM chat_participants WHERE chat_id = $1'

    // aqui eliminamos el contacto del usuario
    // 2)
    const sqlForDeleteContact = 'DELETE FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'

    // aqui eliminamos el ultimo participante del chat que seria este usuario en caso de que el valor de sqlForGetUsersInChat sea menor a 2 usuarios activos 
    // 3)
    const sqlForDeleteChatParticipants = 'DELETE FROM chat_participants WHERE chat_id = $1 AND user_id = $2'

    // aqui eliminamos todos los blocks del chat de contacto
    // 4)
    const sqlForDeleteAllBlocksOfChat = 'DELETE FROM blocks WHERE chat_id = $1'

    // aqui eliminamos todos registro de en la tabla chat_history_deletions que este relacionado con el valor de chatId
    // 5) 
    const sqlForDeleteAllChatHistoryDeletions = 'DELETE FROM chat_history_deletions WHERE chat_id = $1'


    // aqui estamos eliminando todos las notificaciones del chat de contacto con el valor del chatId  
    // 6)
    const sqlForDeleteAllChatNotifications = 'DELETE FROM notifications WHERE chat_id = $1'


    // aqui estamos eliminando todos los mensajes del chat de contacto con el valor del chatId  
    // 7)
    const sqlForDeleteAllChatsMessages = 'DELETE FROM messages WHERE chat_id = $1'


    // por ultimo aqui eliminamos el chat de contacto
    // 8)
    const sqlForDeleteContactChat = 'DELETE FROM chats WHERE chat_id = $1'


    // **********************************************


    // B)*******************************************
    // *********** Aqui eliminamos el contacto usuario, los block del usuario y creamos un registro de eliminacion de historial de mensajes de chat ************

    // Estas queryes estan comentadas por que tienen la misma estructura en el grupo A de arriba, por lo que no es necesario tenerlas activas, solo sirven para orientacion 

    // 1)
    // const sqlForDeleteContact = 'DELETE FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'


    // 2)
    // const sqlForDeleteChatParticipants = 'DELETE FROM chat_participants WHERE chat_id = $1 AND user_id = $2'



    // **** ADVERTENCIA: Aqui ya no eliminamos los blocks del usuario, si no que esperamos a que el ultimo integrante del chat, elimine el chat de contacto, para que todos los blocks de ambos participantes sean eliminados permanentemente *********************
    // 3)
    // const sqlForDeleteBlocksOfUser = 'DELETE FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'


    // 4) 
    const sqlForResgisterChatDeletionMessages = 'INSERT INTO chat_history_deletions(deletion_id, user_id, chat_id, deletion_date) VALUES($1, $2, $3, $4)'




    try {

        if (!userId || !chatId || !contactUserId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // A)*******************************************


        // 1)*******************************************
        // *********** Aqui obtenemos todos los participantes del chat que quedan para la condicional de abajo ************

        const dataForGetAllChatParticipants = [chatId]

        const resultOfGetAllChatParticipants = await connection.query(sqlForGetAllChatParticipants, dataForGetAllChatParticipants)

        console.log(resultOfGetAllChatParticipants.rows)


        if (resultOfGetAllChatParticipants.rows.length === 1) {

            // 2)*******************************************
            // *********** Aqui eliminamos el contacto del usuario ************

            const dataForDeleteContact = [userId, contactUserId, chatId]

            const resultOfDeleteContact = await connection.query(sqlForDeleteContact, dataForDeleteContact)


            if (resultOfDeleteContact.rowCount === 0) {
                console.log('la propiedad rowCount indica que el contact del usuario no se elimino con exito DELETE /contacts')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // 3)*******************************************
            // *********** Aqui eliminamos los participantes de chat ************


            const dataForDeleteChatParticipants = [chatId, userId]

            const resultOfDeleteChatParticipants = await connection.query(sqlForDeleteChatParticipants, dataForDeleteChatParticipants)


            if (resultOfDeleteChatParticipants.rowCount === 0) {
                console.log('la propiedad rowCount indica que el participante no se elimino con exito DELETE /groups')
                throw { status: 500, message: `An error occurred, try again` }
            }



            // 4)*******************************************
            // *********** Aqui eliminamos todos los Blocks del Usuario ************

            const dataForDeleteAllBlocksOfChat = [chatId]

            const resultOfDeleteBlocks = await connection.query(sqlForDeleteAllBlocksOfChat, dataForDeleteAllBlocksOfChat)


            if (resultOfDeleteBlocks.rowCount === 0) {
                console.log('la propiedad rowCount indica que no se encontraron blocks del usuario para eliminarlos con exito DELETE /contacts')
                // throw { status: 500, message: `An error occurred, try again` }
            }


            // 5)*******************************************
            // *********** Aqui eliminamos todos registro de la tabla chat_history_deletions que estan relacionados con el chat de contacto ************

            const dataForDeleteAllChatHistoryDeletions = [chatId]

            const resultOfDeleteAllChatHistoryDeletions = await connection.query(sqlForDeleteAllChatHistoryDeletions, dataForDeleteAllChatHistoryDeletions)


            if (resultOfDeleteAllChatHistoryDeletions.rowCount === 0) {
                console.log('la propiedad rowCount indica que no se encontraron los registros de eliminacion del historial de mensajes en la tabla chat_history_deletions para eliminarlos con exito DELETE /contacts')
                // throw { status: 500, message: `An error occurred, try again` }
            }




            // 6)*******************************************
            // *********** Aqui eliminamos todos las notificaciones del chat de contacto ************

            const dataForDeleteAllChatsNotifications = [chatId]

            const resultOfDeleteAllChatsNotifications = await connection.query(sqlForDeleteAllChatNotifications, dataForDeleteAllChatsNotifications)


            if (resultOfDeleteAllChatsNotifications.rowCount === 0) {
                console.log('la propiedad rowCount indica que nose encontraron  notificaciones para eliminar del contact chat con exito DELETE /contact')
                // throw { status: 500, message: `An error occurred, try again` }
            }


            // 7)*******************************************
            // *********** Aqui eliminamos todos los mensajes del chat de contacto ************

            const dataForDeleteAllChatsMessages = [chatId]

            const resultOfDeleteAllChatsMessages = await connection.query(sqlForDeleteAllChatsMessages, dataForDeleteAllChatsMessages)


            if (resultOfDeleteAllChatsMessages.rowCount === 0) {
                console.log('la propiedad rowCount indica que no se encontraron mensajes que eleminar del contact chat con exito DELETE /grupo')
                // throw { status: 500, message: `An error occurred, try again` }
            }


            // 8)*******************************************
            // *********** Por ultimos aqui eliminamos permanentemente el chat de contacto ************

            const dataForDeleteContactChat = [chatId]

            const resultOfDeleteContactChat = await connection.query(sqlForDeleteContactChat, dataForDeleteContactChat)


            if (resultOfDeleteContactChat.rowCount === 0) {
                console.log('la propiedad rowCount indica que el registro de chat no se elimino permaenente con exito DELETE /contacts')
                throw { status: 500, message: `An error occurred, try again` }
            }



        } else if( resultOfGetAllChatParticipants.rows.length === 2) {


            // ******************************************
            // B)*******************************************


            // 1)*******************************************
            // *********** Aqui eliminamos el contacto del usuario ************

            const dataForDeleteContact = [userId, contactUserId, chatId]

            const resultOfDeleteContact = await connection.query(sqlForDeleteContact, dataForDeleteContact)


            if (resultOfDeleteContact.rowCount === 0) {
                console.log('la propiedad rowCount indica que el contact del usuario no se elimino con exito DELETE /contacts')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // 2)*******************************************
            // *********** Aqui eliminamos los participantes de chat ************


            const dataForDeleteChatParticipants = [chatId, userId]

            const resultOfDeleteChatParticipants = await connection.query(sqlForDeleteChatParticipants, dataForDeleteChatParticipants)


            if (resultOfDeleteChatParticipants.rowCount === 0) {
                console.log('la propiedad rowCount indica que el participante del chat no se elimino con exito DELETE /contact')
                throw { status: 500, message: `An error occurred, try again` }
            }



            // ******* ADVERTENCIA: Aqui ya no eliminamos los blocks del usuario, si no que esperamos a que el ultimo integrante del chat, elimine el chat de contacto, para que todos los blocks de ambos participantes sean eliminados permanentemente ***************************
            // 3)*******************************************
            // *********** Aqui eliminamos todos los Blocks del Usuario ************


            // const resultOfDeleteBlocks = await connection.query(sqlForDeleteBlocksOfUser, dataForDeleteContact)


            // if (resultOfDeleteBlocks.rowCount === 0) {
            //     console.log('la propiedad rowCount indica que los blocks del usuario no se eliminaron con exito DELETE /contact')
            //     throw { status: 500, message: `An error occurred, try again` }
            // }


            // 4)*******************************************
            // *********** Aqui Registramos una eliminacion del historial del chat, para que si el otra conctacto le vuelve a escribir al usuario, este no tenga acceso a los mensajes antiguos ************

            const deletionId = uuidv4()
            const deletionDate = GetCurrentDateString()

            const dataForCreateChatDeletionMessage = [deletionId, userId, chatId, deletionDate]


            const resultOfCreateChatDeletionMessages = await connection.query(sqlForResgisterChatDeletionMessages, dataForCreateChatDeletionMessage)


            if (resultOfCreateChatDeletionMessages.rowCount === 0) {
                console.log('la propiedad rowCount indica que no se registro la eliminacion del historial de mensajes con exito DELETE /contact')
                throw { status: 500, message: `An error occurred, try again` }
            }

        }



        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint DELETE /contacts :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}