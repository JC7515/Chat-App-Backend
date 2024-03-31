import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { GetCurrentDateString } from "../helpers/index.js";



const getGroupMessages = async (sql, chatData) => {

    try {

        const resultOfGetMessages = await connection.query(sql, chatData)


        const messagesList = resultOfGetMessages.rows.reverse()

        // console.log(messagesList)

        let messageListWithUserData = []

        if (messagesList.length > 0) {
            messageListWithUserData = await Promise.all(
                messagesList.map(async (message) => {

                    const sql = 'SELECT * FROM users WHERE user_id = $1'

                    const userDataForSql = [message.user_id]


                    const userData = await connection.query(sql, userDataForSql)

                    const userDataObtained = userData.rows[0]

                    const profilePictureUrl = await GetFileUrl(userDataObtained.profile_picture, 88000)

                    return {
                        ...message,
                        user_data: {
                            user_id: userDataObtained.user_id,
                            username: userDataObtained.username,
                            profile_picture: profilePictureUrl
                        }
                    }

                })
            )

        }


        return messageListWithUserData


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



const getContactMessages = async (sqlForGetChatParticipants, DataForGetChatParticipants, chatId, messagesLimit, creationDate, userId) => {


    try {

        const resultOfGetChatParticipants = await connection.query(sqlForGetChatParticipants, DataForGetChatParticipants)


        const ChatParticipantsObtained = resultOfGetChatParticipants.rows

        // console.log(ChatParticipantsObtained)

        // aqui validamos y filtramos cual es el userid del otro participante del chat   

        const userIdOfTheOtherParticipant = ChatParticipantsObtained.find((participant) => participant.user_id !== userId)



        // 1)
        // ************* Case 1 **************/
        // ************* aqui obtenemos el historial de de bloqueos de cada usuario del chats **************/
        const sqlForGetBlocksOfParticipants = 'SELECT * FROM blocks WHERE chat_id = $1'


        const DataForGetBlocks = [chatId]

        // aqui obtenemos todos los block de cada participante del chat, para luego filtrarlos y separarlos mas abajo
        const resultOfGetAllBlocks = await connection.query(sqlForGetBlocksOfParticipants, DataForGetBlocks)


        const allBlocksObtained = resultOfGetAllBlocks.rows


        // aqui filtramos los blocks de cada participante del chat y se los asignamos a cada uno

        const blocksOfThisUser = []
        const blocksOfTheOtherParticipant = []


        allBlocksObtained.forEach((block) => {
            if (block.blocker_user_id === userId) {
                blocksOfThisUser.push(block)
                return
            }

            if (block.blocker_user_id === userIdOfTheOtherParticipant.user_id) {
                blocksOfTheOtherParticipant.push(block)
                return
            }

            return
        })

        // console.log(blocksOfThisUser)
        // console.log(blocksOfTheOtherParticipant)

        // console.log(`la logitud del blocksOfThisUser es ${blocksOfThisUser.length}`)
        // console.log(`la logitud del blocksOfTheOtherParticipant es ${blocksOfTheOtherParticipant.length}`)



        // aqui estamos agregando un block en el caso de que el usuario o el contacto no tenga ningun block agregado, por que aun no valido al contacto que el envio el mensaje
        const blocksArray = [blocksOfThisUser, blocksOfTheOtherParticipant]

        blocksArray.forEach((blockArray) => {

            if (blockArray.length === 0) {
                const currentDate = new Date(GetCurrentDateString())
                const dateOneWeekAgo = new Date(currentDate.getDate() - 7)


                const blockInactive = {
                    status: 'inactive',
                    block_date: dateOneWeekAgo
                }

                blockArray.push(blockInactive)

                return
            }

            return
        })





        // 2)
        // ************* aqui obtenemos el historial de veces que el usuario elimino todo los mensajes del chat, para utilizarlo como filtro al momento de obtener los mensajes y que solo obtengamos los mensajes que estan despues de la ultima fecha de eliminacion **************/

        const sqlForGetchathistoryDeletion =
            'SELECT * FROM chat_history_deletions WHERE user_id = $1 AND chat_id = $2'

        const GetchathistoryDeletionData = [userId, chatId]

        // query para obtener los datos de la db
        const resultOfGetchathistoryDeletion = await connection.query(sqlForGetchathistoryDeletion, GetchathistoryDeletionData)


        // aqui obtenemos el array de datos de la propiedad .rows que obtuvimos de la db
        const ChathistoryDeletionData = resultOfGetchathistoryDeletion.rows

        // aqui validamos si es que el array que nos devolvio es mayor a 0 elementos, para devolver el ultimo elemento de la lista que contiene la fecha de registro de la ultima vez que el usuario elimino todos los mensajes de un chat de contacto o si es igual a 0 elementos, devolvemos undefined, porque no se encontraron fechas
        const lastDateOfChathistoryDeletion = ChathistoryDeletionData.length > 0 ?
            (
                ChathistoryDeletionData[ChathistoryDeletionData.length - 1].deletion_date
            )
            :
            (undefined)

        // console.log(lastDateOfChathistoryDeletion)

        // 3)
        // ************* aqui obtenemos obtenemos los mensajes para que sean mostrados en la vista **************/


        // aqui validamos si lastDateOfChathistoryDeletion contiene un valor para asi filtra en la base de datos por medio de la fecha de creacion de los mensajes y tambien por la ultima fecha de eliminacion del historial de mensajes en el chat, y si es undefined solo filtramos por la fecha de creacion de los mensajes       
        const sql = lastDateOfChathistoryDeletion ? ('SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 AND timestamp > $3 ORDER BY timestamp DESC OFFSET $4 ROWS FETCH NEXT $5 ROWS ONLY')
            :
            ('SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY')

        // console.log(sql)

        // aqui hacemos la misma validacion que antes, solo para agregar el dato de la fecha de la ultima vez que se elimino los mensajes del chat
        const chatData = lastDateOfChathistoryDeletion ? ([chatId, creationDate, lastDateOfChathistoryDeletion, 0, messagesLimit])
            :
            ([chatId, creationDate, 0, messagesLimit])


        const resultOfGetMessages = await connection.query(sql, chatData)

        const messagesList = resultOfGetMessages.rows.reverse()


        return {
            messagesList: messagesList, blocksArray: blocksArray, blocksOfThisUser: blocksOfThisUser
            , blocksOfTheOtherParticipant: blocksOfTheOtherParticipant
        }


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



const updateMessages = async (sqlForUpdateMessage, messageData) => {

    try {

        const result = await connection.query(sqlForUpdateMessage, messageData)


        if (result.rowCount === 0) {
            console.log(`hubo un problema al actualizar el mensaje }`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}




const deleteMessages = async (sql, messageData) => {

    try {

        const result = await connection.query(sql, messageData)

        if (result.rowCount === 0) {
            console.log(`hubo un problema al eliminar el mensaje en el chat con id ${message.chat_id}`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



export default { getGroupMessages, getContactMessages, updateMessages, deleteMessages }
