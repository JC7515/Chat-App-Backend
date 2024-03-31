import connection from "../../connectionDb.cjs";
import chatParticipantsService from '../services/chatParticipantsService.js'

export const getContactChatParticipants = async (req, res) => {

    const { userId } = req.user
    const { chat_id } = req.query


    // 1)
    const sqlForGetChatData = 'SELECT * FROM chats WHERE chat_id = $1'



    // 2)
    const sqlForGetChatParticipants = 'SELECT * FROM chat_participants WHERE chat_id = $1'


    try {


        // 1)
        /* ******** aqui obtenemos la data del chat **** */
        const chatData = [chat_id]


        const {chatDataObtained, chatParticipantsDataList} = await chatParticipantsService.getContactChatParticipants(chatData, sqlForGetChatData, sqlForGetChatParticipants)

        const data = {
            chat_data: chatDataObtained,
            chat_participants: chatParticipantsDataList
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const getGroupChatParticipants = async (req, res) => {

    const { userId } = req.user
    const { chat_id } = req.query

    // 1)
    const sqlForGetChatData = 'SELECT * FROM chats WHERE chat_id = $1'

    // 2)
    const sqlForGetChatParticipants = 'SELECT * FROM chat_participants WHERE chat_id = $1'


    try {

        const chatData = [chat_id]

        const {chatDataObtained, chatParticipantsDataList} = await chatParticipantsService.getGroupChatParticipants(chatData, sqlForGetChatData, sqlForGetChatParticipants)

        const data = {
            chat_data: chatDataObtained,
            chat_participants: chatParticipantsDataList
        }

        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint //GET groups/chats :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}




export const updateChatParticipant = async (req, res) => {

    const { chatId, participantId, newStatus } = req.query

    // 1)
    const sqlForGetParticipantStatus = 'SELECT * FROM chat_participants WHERE status = $1 AND user_id = $2 '

    // 2)
    const sqlForDesactiveAllParticipantStatus = "UPDATE chat_participants SET status = $1 WHERE user_id = $2 AND chat_id = $3"

    // 3)
    const sqlForUpdateStatus = "UPDATE chat_participants SET status = $1 WHERE user_id = $2 AND chat_id = $3"

    try {


        if (!chatId || !participantId || !newStatus) {
            console.log('faltaron datos en el envio de la peticion PUT /groups/chatParticipant')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }


        // 1)
        /* ******** aqui obtenemos todos los chats en donde el participante aparece con estatus de activo **** */

        const statusToFind = 'active'

        const getDataOFParticipant = [statusToFind, participantId]

        // 2)
        /* ******** aqui actualizamos el status del participante del chat **** */

        const updateStatusData = [newStatus, participantId, chatId]


        await chatParticipantsService.updateChatParticipant(getDataOFParticipant, updateStatusData, sqlForGetParticipantStatus, sqlForDesactiveAllParticipantStatus, sqlForUpdateStatus)



        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint PUT /groups/chatParticipant :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}