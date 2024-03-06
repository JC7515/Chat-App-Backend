import express from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString, GetTwoGroupInicials, TransformDateToCorrectFormatString } from "../helpers/index.js";
import { GetFileUrl } from "../../s3.js";
import { deleteContact, getContactList, getContacts, saveContact } from "../controllers/contactsController.js";
const router = express.Router()


// Aqui obtenemos todos los datos de un chat de contacto en especifico 
// GET /contacts/?chatId=${chatId}&contactUserId=${contactUserId}
router.get('/contacts', authenticate, authorize, getContacts)



// Aqui obtenemos todos los contactos con el user_id de nuestro usuario desde la tabla constacts en la db 
router.get('/contacts/list', authenticate, authorize, getContactList)




router.put('/contacts', (req, res) => {
    // actualizar contacto como a bloqueado o desbloqueado, por el momento no realizaremos esta funcionabilidad
})



// POST /contacts/?contact_user_id=${contact_user_id}
router.post('/contacts', authenticate, authorize, saveContact)


// DELETE /contacts/?chatId={chatId}&contactUserId={contactUserId}
router.delete('/contacts', authenticate, authorize, deleteContact)




export default router