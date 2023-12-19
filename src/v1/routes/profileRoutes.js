import express from "express";
import connection from "../../connectionDb.cjs";
import { DeleteFile, GetFileUrl, UploadFile } from "../../s3.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
const router = express.Router()



router.get('/auth/profile', authenticate, authorize, async (req, res) => {

    const { userId } = req.user

    // console.log(userId)

    let profilePictureUrl = ''

    try {

        const sql = 'SELECT * FROM users WHERE user_id = $1'
        const userData = [userId]


        const result = await connection.query(sql, userData)

        if (result.rows.length === 0) {
            console.log(`User Not Found`)
            throw { status: 404, message: `User profile not found.` }
        }

        // if (result.rows[0].profile_picture) {
        //     try{
        //         profilePictureUrl = await GetFileUrl(result.rows[0].profile_picture, 88000)
        //         console.log(profilePictureUrl)
        //     }catch{
        //         throw { status: 500, message: `Could not retrieve user profile information, please reload the page.` }
        //     }
        // }

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
})

router.put('/profile', authenticate, authorize, async (req, res) => {

    // IMPORTANTE: Cree ne la carpeta de utils una funcion para cambiar el nombre de un archivo de cualquier tipo por medio de fs.rename, y me quede en ver como es que podria cambiar los nombres de los archivos que se suben termporalmente al la carpeta uploads por medio de fileupload, ya que el problema es que los archivos cuando se subiran se llamaran tmp-5654615684161135.jpg y no como el nombre que obtendria extrayendo del objeto req.files la propiedad name, entonces para que eso no pase tendria que buscar una solucion...  


    const { userId } = req.user
    const { profilePicture } = req.files

    // console.log(profilePicture)

    let sqlForSelectPerfil = 'SELECT profile_picture FROM users WHERE user_id = $1'

    const dataForSelectPerfil = [userId]

    let sqlForUpdatePerfil = 'UPDATE users SET profile_picture = $1 WHERE user_id = $2'

    const dataForUpdatePerfil = [profilePicture.name, userId]

    try {

        const userData = await connection.query(sqlForSelectPerfil, dataForSelectPerfil)

        if (userData[0].profile_picture !== "profile-default-avatar-image.png") {
            //Agregar manejador manejador de errores y registro de errores
            const resultOfPictureDelete = await DeleteFile(userData[0].profile_picture)
        }

        const result = await connection.query(sqlForUpdatePerfil, dataForUpdatePerfil)

        if (result.rowCount === 0) {
            console.log('la propiedad rowCount indica que no hay registros actualizados con exito')
            throw { status: 500, message: `La propiedad rowCount indica, que el registro con id ${userId} no se pudo actualizados en la tabla users` }
        }

        //Agregar manejador manejador de errores y registro de errores
        let uploadProfilePicture = await UploadFile(profilePicture)


        if (!uploadProfilePicture) {
            console.log('Ha ocurrido un error al subir el profile_picture al bucket ')
            throw { status: 500, message: `Ha ocurrido un error al subir el profile_picture al bucket` }
        }


        const data = {
            record_Updated_successfully: true
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})


export default router