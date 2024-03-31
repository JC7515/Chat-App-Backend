import connection from "../../connectionDb.cjs";


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 
const getBlocks = async (DataForRegisterBlock, sqlForGetBlocksOfUser) => {

    try {

        // 1)
        // ************ Obtenemos todo el historial de bloqueos del usuario hacia el contacto *************  


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



const saveBlocks = async (DataForRegisterBlock,sqlForResgisterNewBlock) => {


    try {

        const resultOfBlocksCreation = await connection.query(sqlForResgisterNewBlock, DataForRegisterBlock)


        if (resultOfBlocksCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return resultOfBlocksCreation 

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }

}


export default { getBlocks, saveBlocks }