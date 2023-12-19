import express  from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
const router = express.Router()



//  /users/?usernameToSearch=${usernameToSearch}
router.get('/users', authenticate, authorize, async (req, res) => {

    const { usernameToSearch } = req.query

    try {

        const sql = `SELECT * FROM users WHERE username LIKE $1 || '%'`
        const dataForQuery = [usernameToSearch]


        const resultsOfNameSearched = await connection.query(sql, dataForQuery)


        const ListOfUserFounds = resultsOfNameSearched.rows

        // console.log(ListOfUserFounds)

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
)

router.post('/users/is-available', (req, res) => {
    //   validar que el correo del usuario no este ya registrado en la base de datos
})

// /users/socketId/?newSocketId=${newSocketId}
router.put('/users/socketId', authenticate, authorize, async (req, res) => {

    
    const { userId } = req.user
    const { newSocketId } = req.query

    try {

        
        if (!newSocketId) {
            console.log('faltaron datos en el envio de la peticion PUT /users/socketId')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }


        const sql = "UPDATE users SET socket_id = $1 WHERE user_id = $2"

        const dataForQuery = [newSocketId, userId]


        const resultsOfNameSearched = await connection.query(sql, dataForQuery)


        if (resultsOfNameSearched.rowCount === 0) {
            console.log('la propiedad rowCount indica que el no se actualizo la columna socketid del usuario con exito')
            throw { status: 500, message: `An error occurred, try again`}
        }

        // console.log(ListOfUserFounds)


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /users :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})





export default router