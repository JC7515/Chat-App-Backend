import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString } from "../helpers/index.js";
import chatHistoryDeletionsService from "../services/chatHistoryDeletionsService.js";


export const saveChatHistoryDeletions = async (req, res) => {

    const { userId } = req.user
    const { chatId } = req.body


    // 1)
    const sqlForCreatechathistoryDeletion = 'INSERT INTO chat_history_deletions(deletion_id, user_id, chat_id, deletion_date) VALUES($1, $2, $3, $4)'


    try {

        if (!userId || !chatId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // 1)*******************************************
        // *********** Aqui creamos un chathistoryDeletion para que quede registro de que el usuario elimino todo el historial de mensajes del chat con valor chatId  ************


        const deletionId = uuidv4()
        const deletionDate = GetCurrentDateString()

        const dataForCreatechathistoryDeletion = [deletionId, userId, chatId, deletionDate]

        
        await chatHistoryDeletionsService.saveChatHistoryDeletions(dataForCreatechathistoryDeletion, sqlForCreatechathistoryDeletion)


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint POST /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}