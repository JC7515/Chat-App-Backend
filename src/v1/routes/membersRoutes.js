import express from "express";
import { deleteMembers, getMembers, getValidatedMembers, saveMembers, updateMembers } from "../controllers/membersController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router()

// /members/?group_id={group_id}
router.get('/members', authenticate, authorize, getMembers)


// /members/?group_id={group_id}
router.get('/validateMembers', authenticate, authorize, getValidatedMembers)

// /members
router.post('/members', authenticate, authorize, saveMembers)



// esta logica sirve para cambiar el role de un miembro de grupo 
// /members/?userId=${userId}&groupId=${groupId}&role=${role}
router.put('/members', authenticate, authorize, updateMembers)


// /members/?userId=${userId}&groupId=${groupId}&chatId=${chatId}
router.delete('/members', authenticate, authorize, deleteMembers)



export default router