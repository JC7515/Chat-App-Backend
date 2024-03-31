import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import blocks from "../databases/blocks.js";


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 
const getBlocks = async (DataForRegisterBlock , sqlForGetBlocksOfUser) => {

    try {
        
        // 1)
        // ************ Obtenemos todo el historial de bloqueos del usuario hacia el contacto *************  

        const getBlockData = await blocks.getBlocks(DataForRegisterBlock, sqlForGetBlocksOfUser)
    

        // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
        const isContactBlockedForUser = getBlockData[getBlockData.length - 1].status === 'active' ? true : false


        return isContactBlockedForUser

    } catch (error) {
        throw error
    }
}



const saveBlocks = async (DataForRegisterBlock,sqlForResgisterNewBlock) => {


    try {


        const result = await blocks.saveBlocks(DataForRegisterBlock,sqlForResgisterNewBlock)

        return result

    } catch (error) {
        throw error
    }

}



export default { getBlocks, saveBlocks }