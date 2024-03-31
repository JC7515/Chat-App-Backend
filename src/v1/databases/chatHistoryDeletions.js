import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString } from "../helpers/index.js";



const saveChatHistoryDeletions = async (dataForCreatechathistoryDeletion, sqlForCreatechathistoryDeletion) => {

    
    try {
        

        const resultOfQuery = await connection.query(sqlForCreatechathistoryDeletion, dataForCreatechathistoryDeletion)


        if (resultOfQuery.rowCount === 0) {
            console.log('la propiedad rowCount indica que el registro de historial de mensajes elminado no se realizo con exito POST /groups')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return resultOfQuery


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }

}


export default { saveChatHistoryDeletions }