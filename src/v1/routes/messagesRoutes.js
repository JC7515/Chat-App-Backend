import express from "express";
import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { deleteMessages, getContactMessages, getGroupMessages, updateMessages } from "../controllers/messagesController.js";
import { GetCurrentDateString } from "../helpers/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";


const router = express.Router()



// GET /group/messages/?chatId={chatId}&messagesLimit={messagesLimit}&creationDate={creationDate}
router.get('/group/messages', authenticate, authorize, getGroupMessages)




// GET /contact/messages/?chatId={chatId}&messagesLimit={messagesLimit}&creationDate={creationDate}
router.get('/contact/messages', authenticate, authorize, getContactMessages)




// PUT /messages/?messageId={messageId}&newReadStatus={newReadStatus}&newReadTimestamp={newReadTimestamp}
router.put('/messages', authenticate, authorize, updateMessages)


// /messages/?messageId={messageId}
router.delete('/messages', authenticate, authorize, deleteMessages)



export default router