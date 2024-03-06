import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { getContactChatParticipants, getGroupChatParticipants, updateChatParticipant } from "../controllers/chatParticipantsController.js";
const router = express.Router()


// GET /contact/chatParticipant/?chat_id=${chatId}
// aqui obtenemos los datos de un chat de tipo contact
router.get('/contact/chatParticipant', authenticate, authorize, getContactChatParticipants)


// GET /groups/chatParticipant/?chat_id=${chatId}
// aqui obtenemos los datos de un chat de tipo group
router.get('/groups/chatParticipant', authenticate, authorize, getGroupChatParticipants)



// aqui actualizamos el status del participante del chat cuando ingresa o sale de un chat de Contacto

// PUT /contact/chatParticipant/?chatId=${chatId}&participantId=${participantId}&newStatus=${newStatus}
router.put('/chatParticipant', authenticate, authorize, updateChatParticipant)

export default router