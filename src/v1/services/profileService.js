import connection from "../../connectionDb.cjs";
import { DeleteFile, GetFileUrl, UploadFile } from "../../s3.js";
import { GenerateNewFileNameOfProfile, GenerateSqlToUpdateProfileData } from "../utils/index.js";
import profile from "../databases/profile.js";

const getUserData = async (sql, userData) => {

    try {
        let profilePictureUrl = ''

        const resultOfGetUserData = await profile.getUserData(sql, userData)


        if (resultOfGetUserData[0].profile_picture) {
            try {
                profilePictureUrl = await GetFileUrl(resultOfGetUserData[0].profile_picture, 88000)
                // console.log(profilePictureUrl)
            } catch {
                throw { status: 500, message: `Could not retrieve user profile information, please reload the page.` }
            }
        }

        const user = resultOfGetUserData[0]

        return { user: user, profilePictureUrl }

    } catch (error) {
        throw error
    }
}


const updateUserData = async (sqlForSelectPerfil, dataForSelectPerfil, dinamicSqlForUpdateUserData, dataForUpdateUserInfo, profilePicture) => {

    try {


        await profile.updateUserData(sqlForSelectPerfil, dataForSelectPerfil, dinamicSqlForUpdateUserData, dataForUpdateUserInfo)

        //Agregar manejador manejador de errores y registro de errores
        let uploadProfilePicture = await UploadFile(profilePicture)


        if (!uploadProfilePicture) {
            console.log('Ha ocurrido un error al subir el profile_picture al bucket ')
            throw { status: 500, message: `Ha ocurrido un error al subir el profile_picture al bucket` }
        }



    } catch (error) {
        throw error
    }
}


export default { getUserData, updateUserData }