import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 
export const getBlocks = async (userId, contactUserId, chatId, sqlForGetBlocksOfUser) => {

    try {
        
        // 1)
        // ************ Obtenemos todo el historial de bloqueos del usuario hacia el contacto *************  


        const DataForRegisterBlock = [userId, contactUserId, chatId]


        const resultOfGetBlocksData = await connection.query(sqlForGetBlocksOfUser, DataForRegisterBlock)

        const getBlockData = resultOfGetBlocksData.rows


        if (getBlockData.length === 0) {
            console.log('no se devolvio como minimo el bloqueo de registro con estatus inactive en la lista de bloqueos hechos por el usuario a l contacto')
            throw { status: 500, message: `An error occurred, try again` }
        }
        

        return getBlockData


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



export const saveBlocks = async (req, res) => {


    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }

}