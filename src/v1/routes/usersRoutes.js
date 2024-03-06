import express from "express";
import { getUserToSearch, updateUserSocketId } from "../controllers/usersController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
const router = express.Router()



//  /users/?usernameToSearch=${usernameToSearch}&offset={offset}&limit={limit}
router.get('/users', authenticate, authorize, getUserToSearch
)

router.post('/users/is-available', (req, res) => {
    //   validar que el correo del usuario no este ya registrado en la base de datos
})

// /users/socketId/?newSocketId=${newSocketId}
router.put('/users/socketId', authenticate, authorize, updateUserSocketId)





export default router