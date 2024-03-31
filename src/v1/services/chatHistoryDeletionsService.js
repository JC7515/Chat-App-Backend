import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString } from "../helpers/index.js";
import chatHistoryDeletions from "../databases/chatHistoryDeletions.js"



const saveChatHistoryDeletions = async (dataForCreatechathistoryDeletion, sqlForCreatechathistoryDeletion) => {

    
    try {
        
        const result = await chatHistoryDeletions.saveChatHistoryDeletions(dataForCreatechathistoryDeletion, sqlForCreatechathistoryDeletion)

        return result

    } catch (error) {
        throw error
    }

}


export default { saveChatHistoryDeletions }