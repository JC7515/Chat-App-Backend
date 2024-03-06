import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import {  } from "../services/blocksService.js";


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 
export const getBlocks = async (req, res) => {


    const { userId } = req.user
    const { contactUserId, chatId } = req.query


    // 1)
    const sqlForGetBlocksOfUser = 'SELECT * FROM blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2 AND chat_id = $3'


    try {

        if (!userId || !contactUserId || !chatId) {
            console.log('faltaron datos en el envio de la peticion POST /contacts')
            throw {
                status: 400, message: `An error occurred, try again​`
            }
        }



        // 1)
        // ************ Obtenemos todo el historial de bloqueos del usuario hacia el contacto *************  


        const DataForRegisterBlock = [userId, contactUserId, chatId]


        const resultOfGetBlocksData = await connection.query(sqlForGetBlocksOfUser, DataForRegisterBlock)

        const getBlockData = resultOfGetBlocksData.rows


        if (getBlockData.length === 0) {
            console.log('no se devolvio como minimo el bloqueo de registro con estatus inactive en la lista de bloqueos hechos por el usuario a l contacto')
            throw { status: 500, message: `An error occurred, try again` }
        }

    

        // aqui validamos el ultimo bloqueo que hizo el usuario al contacto y si esta es activo, es decir que lo tiene bloqueado al contacto, para que se visualize de esta forma en la vista
        const isContactBlockedForUser = getBlockData[getBlockData.length - 1].status === 'active' ? true : false

        


        const data = {
            is_Contact_Blocked: isContactBlockedForUser
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /contact/blocks:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const saveBlocks = async (req, res) => {


    const { userId } = req.user
    const { contactUserId, blockStatus, chatId, blockDate } = req.body


    // 1)
    const sqlForResgisterNewBlock = 'INSERT INTO blocks( block_id, blocker_user_id, blocked_user_id, block_date, chat_id, status) VALUES($1, $2, $3, $4, $5, $6)'


    try {

        if (!userId || !contactUserId || !blockStatus || !chatId) {
            console.log('faltaron datos en el envio de la peticion POST /contacts')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }



        // 1)
        // ************ Creacion de registro de bloqueo para este usuario del chat de contacto *************  


        const block_id = uuidv4()

        const DataForRegisterBlock = [block_id, userId, contactUserId, blockDate, chatId, blockStatus]


        const resultOfBlocksCreation = await connection.query(sqlForResgisterNewBlock, DataForRegisterBlock)


        if (resultOfBlocksCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint /SignUp :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}