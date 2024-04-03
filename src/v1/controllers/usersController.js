import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import usersService from "../services/usersService.js";


export const getUserToSearch = async (req, res) => {

    const { usernameToSearch, offset, limit } = req.query



    const sql = `SELECT user_id, username, profile_picture FROM users WHERE username LIKE $1 || '%' ORDER BY username ASC OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY`


    try {

        if (!offset || !limit) {
            throw { status: 404, message: `query parameters are missing.` }
        }


        const dataForQuery = [usernameToSearch, offset, limit]

        const ListOfUserFounds = await usersService.getUserToSearch(sql, dataForQuery)


        const data = {
            list_usersFound: ListOfUserFounds
        }


        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}




export const updateUserSocketId = async (req, res) => {


    const { userId } = req.user
    const { newSocketId } = req.query

    const sql = "UPDATE users SET socket_id = $1 WHERE user_id = $2"

    try {


        if (!newSocketId) {
            console.log('faltaron datos en el envio de la peticion PUT /users/socketId')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }


        const dataForQuery = [newSocketId, userId]


        await usersService.updateUserSocketId(sql, dataForQuery)

        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}