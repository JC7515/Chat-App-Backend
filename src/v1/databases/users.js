import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";



const getUserToSearch = async (sql, dataForQuery) => {

    try {

        const resultsOfQuery = await connection.query(sql, dataForQuery)

        const resultsOfNameSearched = resultsOfQuery.rows

        return resultsOfNameSearched

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}




const updateUserSocketId = async (sql, dataForQuery) => {

    try {

        const resultsOfNameSearched = await connection.query(sql, dataForQuery)


        if (resultsOfNameSearched.rowCount === 0) {
            console.log('la propiedad rowCount indica que el no se actualizo la columna socketid del usuario con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}

export default { getUserToSearch, updateUserSocketId }