import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { getBlocks } from "../databases/blocks.js";


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 
export const getBlocks = async (userId, contactUserId, chatId, sqlForGetBlocksOfUser) => {

    try {
        
        // 1)
        // ************ Obtenemos todo el historial de bloqueos del usuario hacia el contacto *************  

  
        const getBlockData = await getBlocks(userId, contactUserId, chatId, sqlForGetBlocksOfUser)
    

        // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
        const isContactBlockedForUser = getBlockData[getBlockData.length - 1].status === 'active' ? true : false


        return isContactBlockedForUser

    } catch (error) {
        throw error
    }
}



export const saveBlocks = async (req, res) => {


    try {
        


    } catch (error) {
        throw error
    }

}