import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { GetCurrentDateString } from "../helpers/index.js";
import messagesService from "../services/messagesService.js";


export const getGroupMessages = async (req, res) => {


    const { userId } = req.user
    const { chatId, messagesLimit, creationDate } = req.query

    // console.log(userId, chatId)

    const sql = 'SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY'

    try {


        console.log(chatId, messagesLimit, creationDate)
        if (!chatId || !messagesLimit || !creationDate) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }

        // const sql = 'SELECT * FROM messages WHERE chat_id = $1'

        // const chatData = [chatId]
        const chatData = [chatId, creationDate, 0, messagesLimit]


        const messageListWithUserData = await messagesService.getGroupMessages(sql, chatData)


        // console.log(messageListWithUserData)

        const data = {
            messages: messageListWithUserData
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const getContactMessages = async (req, res) => {


    const { userId } = req.user
    const { chatId, messagesLimit, creationDate } = req.query

    // console.log(userId, chatId)

    try {


        console.log(chatId, messagesLimit, creationDate, userId)
        if (!chatId || !messagesLimit || !creationDate) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }

        // aqui tendriamos que agregar logica para extraer las fechas en la cuales un usuario bloqueo a otro usuario y solo extraer los mensajes del chat en que el usuario bloqueado no fue bloqueado por el otro usuario  

        // 1)
        const sqlForGetChatParticipants = 'SELECT chat_id, user_id FROM chat_participants WHERE chat_id = $1'




        const DataForGetChatParticipants = [chatId]


        const messageListWithUserData = await messagesService.getContactMessages(sqlForGetChatParticipants, DataForGetChatParticipants, chatId, messagesLimit, creationDate, userId)
  
        console.log(messageListWithUserData)

        const data = {
            messages: messageListWithUserData
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /contact/messages/ :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const updateMessages = async (req, res) => {

    const { messageId, newReadStatus, newReadTimestamp } = req.query

    const sqlForUpdateMessage = "UPDATE messages SET is_read = $1, read_timestamp = $2 WHERE message_id = $3"

    try {
            
        console.log('se ejecuto una actualizacion de mensaje')
        console.log(messageId, newReadStatus, newReadTimestamp)
        if (!messageId || !newReadStatus ||  !newReadTimestamp  ) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }
         

        const messageData = [newReadStatus, newReadTimestamp, messageId]

        await messagesService.updateMessages(sqlForUpdateMessage, messageData)


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint PUT /messages/ :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}




export const deleteMessages = async (req, res) => {

    const { userId } = req.user
    const { messageId } = req.query

    const sql = `DELETE FROM messages WHERE message_id = $1`

    try {

        const messageData = [messageId]


        const result = await connection.query(sql, messageData)


        if (result.rowCount === 0) {
            console.log(`hubo un problema al eliminar el mensaje en el chat con id ${message.chat_id}`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}





