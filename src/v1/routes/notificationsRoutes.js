import express from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'
import { deleteAllNotifications, deleteNotifications, getAllNotifications, getNotificacions, saveContactNotificaciones, saveGroupNotifications } from "../controllers/notificationsController.js";
const router = express.Router()



router.get('/notifications', authenticate, authorize, getNotificacions)


// /all/notifications/?chat_id=${chat_id}
router.get('/all/notifications', authenticate, authorize, getAllNotifications)

router.post('/group/notifications', authenticate, authorize, saveGroupNotifications)


router.post('/contact/notifications', authenticate, authorize, saveContactNotificaciones)



// /notifications/?messageId=${messageId}
router.delete('/notifications', authenticate, authorize, deleteNotifications)

// DELETE /all/notifications?chat_id=${chat_id}
router.delete('/all/notifications', authenticate, authorize, deleteAllNotifications)



export default router