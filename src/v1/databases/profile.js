import connection from "../../connectionDb.cjs";
import { DeleteFile, GetFileUrl, UploadFile } from "../../s3.js";
import { GenerateNewFileNameOfProfile, GenerateSqlToUpdateProfileData } from "../utils/index.js";


const getUserData = async (sql, userData) => {

    try {

        const result = await connection.query(sql, userData)

        const resultOfGetUserData = result.rows

        if (resultOfGetUserData.length === 0) {
            console.log(`User Not Found`)
            throw { status: 404, message: `User profile not found.` }
        }

        return resultOfGetUserData

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


const updateUserData = async (sqlForSelectPerfil, dataForSelectPerfil, dinamicSqlForUpdateUserData, dataForUpdateUserInfo) => {

    try {

        // 1)
        // * ******* Aqui buscamos el nombre actual de foto de perfil del usuario y lo elminamos para puego actualizarlo ******** * /   

        const userData = await connection.query(sqlForSelectPerfil, dataForSelectPerfil)

        console.log(userData.rows)

        if (userData.rows[0].profile_picture !== "image-default-avatar-profile-1.png") {
            //Agregar manejador manejador de errores y registro de errores
            await DeleteFile(userData.rows[0].profile_picture)
        }


        // 2)
        // * ******* Aqui subimos la nueva foto de perfil a bucket y actualizamos el valor en la basse de datos con el nombre de la nueva foto de perfil ******** * /

        const resultOfUpdateUserData = await connection.query(dinamicSqlForUpdateUserData, dataForUpdateUserInfo)

        console.log(dinamicSqlForUpdateUserData)
        console.log(dataForUpdateUserInfo)

        if (resultOfUpdateUserData.rowCount === 0) {
            console.log('la propiedad rowCount indica que no hay registros actualizados con exito')
            throw { status: 500, message: `La propiedad rowCount indica, que el registro con id ${userId} no se pudo actualizados en la tabla users` }
        }

        return

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



export default { getUserData, updateUserData }