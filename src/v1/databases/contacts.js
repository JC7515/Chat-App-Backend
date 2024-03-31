import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString, GetTwoGroupInicials, TransformDateToCorrectFormatString } from "../helpers/index.js";
import { GetFileUrl } from "../../s3.js";


const getContacts = async (sql, ContactData, userId) => {

    try {


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

                    // 5)
                    const sqlToGetValueOfThisContactIsDeletedFromContact = 'SELECT this_contact_is_deleted FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'


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

                    // 5) ***************************
                    // aqui obteniendo el valor this_contact_is_deleted del contacto del usuario sea true o false, esto para poder validar si el contacto lo elimino a este usuario como su contacto


                    const dataForGetValueOfThisContactIsDeletedFromContact = [contact.contact_user_id, userId, contact.chat_id]

                    const resultOfValueOfThisContactIsDeletedFromContact = await connection.query(sqlToGetValueOfThisContactIsDeletedFromContact, dataForGetValueOfThisContactIsDeletedFromContact)


                    // *******************************

                    const resultOfGetContactData = GetContactData.rows[0]

                    const resultOfGetParticipantStatus = GetParticipantStatus.rows[0]

                    const wasUserDeletedByHisContactValue = resultOfValueOfThisContactIsDeletedFromContact.rows[0].this_contact_is_deleted


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

                    let isUserValidatedForContact =
                        ContactblocksList.length > 0 ? true : false


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
                        contact_blocked_you: isUserBlockedForContact,
                        contact_has_validated_you: isUserValidatedForContact,
                        was_User_Deleted_By_His_Contact: wasUserDeletedByHisContactValue
                    }


                    // /* ********* Aqui validamos el ultimo bloquo que hizo el usuario a este contacto y si el bloqueo es active o inactive *********** */

                    // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
                    const isContactValidatedForUser = userBlocksList.length > 0 ? true : false

                    const isContactBlockedForUser = isContactValidatedForUser && userBlocksList[userBlocksList.length - 1].status === 'active' ? true : false

                    // aqui estamos transformando la fecha de creacion de los contactos a un formato string 
                    const creationDateOfContact = TransformDateToCorrectFormatString(contact.creation_date)

                    return {
                        user_id: userId,
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

        return contactsListOfUser

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}




const getContactList = async (sql, userData, userId) => {

    try {


        const resultOfGetUserContacts = await connection.query(sql, userData)


        // aqui estamos filtrando solo los contactos del usuario que en su campo this_contact_is_deleted en la tabla contacts de db enten en false, haciendo referencia que el usuario no elimino al contacto  
        const contactsList = resultOfGetUserContacts.rows.filter((contact) => contact.this_contact_is_deleted === false)


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


                    // 5)
                    const sqlToGetValueOfThisContactIsDeletedFromContact = 'SELECT this_contact_is_deleted FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'


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


                    // 5) ***************************
                    // aqui obteniendo el valor this_contact_is_deleted del contacto del usuario sea true o false, esto para poder validar si el contacto lo elimino a este usuario como su contacto


                    const dataForGetValueOfThisContactIsDeletedFromContact = [contact.contact_user_id, userId, contact.chat_id]

                    const resultOfValueOfThisContactIsDeletedFromContact = await connection.query(sqlToGetValueOfThisContactIsDeletedFromContact, dataForGetValueOfThisContactIsDeletedFromContact)


                    // *******************************

                    const resultOfGetContactData = GetContactData.rows[0]

                    const resultOfGetParticipantStatus = GetParticipantStatus.rows[0]


                    const wasUserDeletedByHisContactValue = resultOfValueOfThisContactIsDeletedFromContact.rows[0].this_contact_is_deleted



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

                    let isUserValidatedForContact =
                        ContactblocksList.length > 0 ? true : false

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
                        contact_blocked_you: isUserBlockedForContact,
                        contact_has_validated_you: isUserValidatedForContact,
                        was_User_Deleted_By_His_Contact: wasUserDeletedByHisContactValue
                    }


                    // /* ********* Aqui validamos el ultimo bloquo que hizo el usuario a este contacto y si el bloqueo es active o inactive *********** */

                    // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
                    const isContactValidatedForUser = userBlocksList.length > 0 ? true : false

                    const isContactBlockedForUser = isContactValidatedForUser && userBlocksList[userBlocksList.length - 1].status === 'active' ? true : false

                    // aqui estamos transformando la fecha de creacion de los contactos a un formato string 
                    const creationDateOfContact = TransformDateToCorrectFormatString(contact.creation_date)

                    return {
                        user_id: userId,
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

        return contactsListOfUser


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



const saveContact = async (sqlForGetExistingContact, dataForSearchContact, sqlForRegisterUsersToChat, sqlForResgisterNewContact, sqlForCreateChat, sqlForResgisterNewBlockInactive, userId, contact_user_id) => {

    try {


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

        return

    } catch (error) {
        throw error
    }
}



const deleteContact = async (sqlForValidateAllContacts, dataToObtainAllContactInformation, sqlForDeleteContacts, sqlForDeleteChatParticipants, sqlForDeleteAllBlocksOfChat, sqlForDeleteAllChatHistoryDeletions, sqlForDeleteAllChatNotifications, sqlForDeleteAllChatsMessages, sqlForDeleteContactChat, sqlForUpdateContactInformation, sqlForResgisterChatDeletionMessages, userId, contactUserId, chatId) => {

    try {



        const resultOfGetAllContactsData = await connection.query(sqlForValidateAllContacts, dataToObtainAllContactInformation)

        console.log('resultOfGetAllChatParticipants')
        console.log(resultOfGetAllContactsData.rows)

        // aqui estamos extrayendo solo los objetos que tenga la propiedad this_contact_is_deleted en false, para ejecutar una de la dos condicionales que estan mas abajo
        const numberOfContactsNotDeletedInChat = resultOfGetAllContactsData.rows.filter((contact) => contact.this_contact_is_deleted === false)


        if (numberOfContactsNotDeletedInChat.length === 1) {

            // 2)*******************************************
            // *********** Aqui eliminamos el contacto del usuario ************

            const dataForDeleteContact = [chatId]

            const resultOfDeleteContact = await connection.query(sqlForDeleteContacts, dataForDeleteContact)


            if (resultOfDeleteContact.rowCount === 0) {
                console.log('la propiedad rowCount indica que el contact del usuario no se elimino con exito DELETE /contacts')
                throw { status: 500, message: `An error occurred, try again` }
            }


            // 3)*******************************************
            // *********** Aqui eliminamos los participantes de chat ************


            const dataForDeleteChatParticipants = [chatId]

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



        } else if (numberOfContactsNotDeletedInChat.length === 2) {


            // ******************************************
            // B)*******************************************


            // 1)*******************************************
            // *********** Aqui eliminamos el contacto del usuario ************

            // const dataForDeleteContact = [userId, contactUserId, chatId]

            // const resultOfDeleteContact = await connection.query(sqlForDeleteContact, dataForDeleteContact)


            // if (resultOfDeleteContact.rowCount === 0) {
            //     console.log('la propiedad rowCount indica que el contact del usuario no se elimino con exito DELETE /contacts')
            //     throw { status: 500, message: `An error occurred, try again` }
            // }


            // // 2)*******************************************
            // // *********** Aqui eliminamos los participantes de chat ************


            // const dataForDeleteChatParticipants = [chatId, userId]

            // const resultOfDeleteChatParticipants = await connection.query(sqlForDeleteChatParticipants, dataForDeleteChatParticipants)


            // if (resultOfDeleteChatParticipants.rowCount === 0) {
            //     console.log('la propiedad rowCount indica que el participante del chat no se elimino con exito DELETE /contact')
            //     throw { status: 500, message: `An error occurred, try again` }
            // }



            // ******* ADVERTENCIA: Aqui ya no eliminamos los blocks del usuario, si no que esperamos a que el ultimo integrante del chat, elimine el chat de contacto, para que todos los blocks de ambos participantes sean eliminados permanentemente ***************************
            // 3)*******************************************
            // *********** Aqui eliminamos todos los Blocks del Usuario ************


            // const resultOfDeleteBlocks = await connection.query(sqlForDeleteBlocksOfUser, dataForDeleteContact)


            // if (resultOfDeleteBlocks.rowCount === 0) {
            //     console.log('la propiedad rowCount indica que los blocks del usuario no se eliminaron con exito DELETE /contact')
            //     throw { status: 500, message: `An error occurred, try again` }
            // }


            // 4)*******************************************
            // *********** aqui actualizamos el valor de la columna this_contact_is_deleted de la tabla contacts del primer participante en eliminar a su contacto ************

            const valueOfThisContactIsDeleted = true

            const dataForUpdateContactInformation = [valueOfThisContactIsDeleted, userId, chatId]


            const resultOfUpdateContactInformation = await connection.query(sqlForUpdateContactInformation, dataForUpdateContactInformation)


            if (resultOfUpdateContactInformation.rowCount === 0) {
                console.log('la propiedad rowCount indica que no se actualizo el valor del campo this_contact_is_deleted del contacto con exito DELETE /contact')
                throw { status: 500, message: `An error occurred, try again` }
            }




            // 5)*******************************************
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


        return


    } catch (error) {
        throw error
    }
}



export default { getContacts, getContactList, saveContact, deleteContact }