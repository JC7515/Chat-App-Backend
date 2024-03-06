import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { deleteGroups, getGroups, saveGroups } from "../controllers/groupsController.js";
const router = express.Router()

// /groups/
router.get('/groups', authenticate, authorize, getGroups)

// /groups/?groupId={groupId}
router.put('/groups', (req, res) => {
    // actualizar la informacion de un grupo
})

// /groups/
router.post('/groups', authenticate, authorize, saveGroups)

// /groups/?chatId={chatId}&groupId={groupId}
router.delete('/groups', authenticate, authorize, deleteGroups)



export default router