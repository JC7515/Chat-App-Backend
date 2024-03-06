import express from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'
import { getBlocks, saveBlocks } from "../controllers/blocksController.js";
const router = express.Router()


// Aqui obtenemos obtenemos la validacon si este usuario ah bloqueado al contacto del chatId que se pasa como valor 

// GET /contact/blocks/?contactUserId=${contactUserId}&blockStatus=${blockStatus}&chatId=${chatId}
router.get('/contact/blocks', authenticate, authorize, getBlocks)

router.put('/contacts', (req, res) => {
    // actualizar contacto como a bloqueado o desbloqueado, por el momento no realizaremos esta funcionabilidad
})


// POST /blocks/
router.post('/blocks', authenticate, authorize, saveBlocks)

router.delete('/contacts', (req, res) => {
    // eleminar un contacto de tu lista   
})



export default router