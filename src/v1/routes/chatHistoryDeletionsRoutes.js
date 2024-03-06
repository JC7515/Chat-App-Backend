import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { saveChatHistoryDeletions } from "../controllers/chatHistoryDeletionsController.js";
const router = express.Router()



// POST /contact/chathistoryDeletions/
router.post('/contact/chathistoryDeletions', authenticate, authorize, saveChatHistoryDeletions)



export default router