import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString } from "../helpers/index.js";



export const saveChatHistoryDeletions = async (req, res) => {

    
    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }

}