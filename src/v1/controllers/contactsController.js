import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString, GetTwoGroupInicials, TransformDateToCorrectFormatString } from "../helpers/index.js";
import { GetFileUrl } from "../../s3.js";
import contactsService from "../services/contactsService.js";

export const getContacts = async (req, res) => {

    const { userId } = req.user
    const { chatId, contactUserId } = req.query

    const sql = 'SELECT * FROM contacts WHERE user_id = $1 AND contact_user_id = $2 AND chat_id = $3'

    try {

        if (!chatId || !contactUserId) {
            console.log('faltaron datos en el envio de la peticion GET /contacts')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }

        // 0)
        const ContactData = [userId, contactUserId, chatId]

        
        const contactsListOfUser = await contactsService.getContacts(sql, ContactData, userId)
                  

        const data = {
            contact_data: contactsListOfUser[0]
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /v1/contacts/ :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}




export const getContactList = async (req, res) => {

    const { userId } = req.user

    // console.log(userId)

    try {


        // 0)
        const sql = 'SELECT * FROM contacts WHERE user_id = $1'
        const userData = [userId]

        
        const contactsListOfUser = await contactsService.getContactList(sql, userData, userId)
    

        const data = {
            contacts_list: contactsListOfUser
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /v1/contacts/ :', error);

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

   
        await contactsService.saveContact(sqlForGetExistingContact, dataForSearchContact, sqlForRegisterUsersToChat, sqlForResgisterNewContact, sqlForCreateChat, sqlForResgisterNewBlockInactive, userId, contact_user_id)



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

    // Este clausula sql nos sirve para obtener todos los participantes del chat que han o no han eliminado a su contacto, si un solo participante elimino a su contacto,no se eliminara toda la informacion del chat, pero si los dos se muestran como eliminados o true en this_contact_is_deleted en la tabla de contacts , se eliminara todos los mensajes, el chat, los block y los registros de elimininacion de historial de mensajes del chat, que aun quedan relacionado a ese chat de contacto sin poder recuperarse    
    // 1)
    const sqlForValidateAllContacts = 'SELECT this_contact_is_deleted FROM contacts WHERE chat_id = $1'


    // aqui eliminamos todos contactos del chat
    // 2)
    const sqlForDeleteContacts = 'DELETE FROM contacts WHERE chat_id = $1'

    // aqui eliminamos todos los participante del chat en caso de que el valor de sqlForGetUsersInChat sea menor a 2 usuarios del chat con la columna this_contact_is_deleted en false
    // 3)
    const sqlForDeleteChatParticipants = 'DELETE FROM chat_participants WHERE chat_id = $1'

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

    // aqui actualizamos el valor de la columna this_contact_is_deleted del primer participante en eliminar a su contacto
    // 4)
    const sqlForUpdateContactInformation = 
    "UPDATE contacts SET this_contact_is_deleted = $1 WHERE user_id = $2 AND chat_id = $3"

    // aqui estamos insertamos un registro de eliminacion de chat para el participante que elimino primero a su contacto para asi cuando este le vuelva hablar a su contacto o el contacto le mande mensajes nuevamente, a este no le aparescan todos los mensajes anteriores a la eliminacion  
    // 5) 
    const sqlForResgisterChatDeletionMessages = 'INSERT INTO chat_history_deletions(deletion_id, user_id, chat_id, deletion_date) VALUES($1, $2, $3, $4)'




    try {

        if (!userId || !chatId || !contactUserId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // A)*******************************************


        // 1)*******************************************
        // *********** Aqui obtenemos todos los participantes del chat que quedan para la condicional de abajo ************

        const dataToObtainAllContactInformation = [chatId]

        await contactsService.deleteContact(sqlForValidateAllContacts, dataToObtainAllContactInformation, sqlForDeleteContacts, sqlForDeleteChatParticipants, sqlForDeleteAllBlocksOfChat, sqlForDeleteAllChatHistoryDeletions, sqlForDeleteAllChatNotifications, sqlForDeleteAllChatsMessages, sqlForDeleteContactChat, sqlForUpdateContactInformation, sqlForResgisterChatDeletionMessages, userId, contactUserId, chatId) 


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint DELETE /contacts :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}