import connection from "../../connectionDb.cjs";
import { DeleteFile, GetFileUrl, UploadFile } from "../../s3.js";
import { GenerateNewFileNameOfProfile, GenerateSqlToUpdateProfileData } from "../utils/index.js";


export const getUserData = async (req, res) => {

    const { userId } = req.user

    // console.log(userId)

    let profilePictureUrl = ''

    try {

        const sql = 'SELECT * FROM users WHERE user_id = $1'
        const userData = [userId]


        const result = await connection.query(sql, userData)

        const resultOfGetUserData = result.rows

        if (resultOfGetUserData.length === 0) {
            console.log(`User Not Found`)
            throw { status: 404, message: `User profile not found.` }
        }

        if (resultOfGetUserData[0].profile_picture) {
            try{
                profilePictureUrl = await GetFileUrl(resultOfGetUserData[0].profile_picture, 88000)
                console.log(profilePictureUrl)
            }catch{
                throw { status: 500, message: `Could not retrieve user profile information, please reload the page.` }
            }
        }

        const user = result.rows[0]
        const data = {
            user_id: user.user_id,
            username: user.username,
            name: user.name,
            biography: user.biography,
            phone: user.phone,
            email: user.email,
            profile_picture: profilePictureUrl,
            create_at: user.create_at,
        }




        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}


export const updateUserData = async (req, res) => {

    // IMPORTANTE: Cree en la carpeta de utils una funcion para cambiar el nombre de un archivo de cualquier tipo por medio de fs.rename, y me quede en ver como es que podria cambiar los nombres de los archivos que se suben termporalmente al la carpeta uploads por medio de fileupload, ya que el problema es que los archivos cuando se subiran se llamaran tmp-5654615684161135.jpg y no como el nombre que obtendria extrayendo del objeto req.files la propiedad name, entonces para que eso no pase tendria que buscar una solucion...  


    const { userId } = req.user

    const { profilePicture } = req.files
    const { userName, bio, phone, email, password } = req.body


    console.log(profilePicture)

    // 1)
    let sqlForSelectPerfil = 'SELECT profile_picture FROM users WHERE user_id = $1'

    const dataForSelectPerfil = [userId]


    // 2)    
    // aqui estamos actualizando el nombre de la foto de perfil de asuario para que luego sea almacenada en el db y en el bucket
    const newFileName = `profile-picture-${userId}`
    const originalFileName = profilePicture.name

    profilePicture.name = GenerateNewFileNameOfProfile(newFileName, originalFileName)

    console.log(profilePicture.name)


    // * ****** aqui la logica para crear un consulta sql dinamica actualizar los datos del usuario en la db ****** */
    const frontData = [userName, password, bio, phone, email, profilePicture.name, userId]

    const dbFields = ['username', 'password', 'biography', 'phone', 'email', 'profile_picture', 'user_id']

    // aqui obtenemos todos los datos que no sean undefined
    const dataForUpdateUserInfo = frontData.filter((data) => data)

    // aqui obtenemos la consula sql dinamica para actualizar los datos de usuario en la db
    const dinamicSqlForUpdateUserData = GenerateSqlToUpdateProfileData(frontData, dbFields)

    console.log(dinamicSqlForUpdateUserData)
    console.log(dataForUpdateUserInfo)


    try {

        // 1)
        // * ******* Aqui buscamos el nombre actual de foto de perfil del usuario y lo elminamos para puego actualizarlo ******** * /   

        const userData = await connection.query(sqlForSelectPerfil, dataForSelectPerfil)

        console.log(userData.rows)

        if (userData.rows[0].profile_picture !== "image-default-avatar-profile-1.png") {
            //Agregar manejador manejador de errores y registro de errores
            const resultOfPictureDelete = await DeleteFile(userData.rows[0].profile_picture)
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

        //Agregar manejador manejador de errores y registro de errores
        let uploadProfilePicture = await UploadFile(profilePicture)


        if (!uploadProfilePicture) {
            console.log('Ha ocurrido un error al subir el profile_picture al bucket ')
            throw { status: 500, message: `Ha ocurrido un error al subir el profile_picture al bucket` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint /profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}