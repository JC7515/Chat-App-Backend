import express from "express";
import { getUserData, updateUserData } from "../controllers/profileController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
const router = express.Router()



router.get('/auth/profile', authenticate, authorize, getUserData)

router.put('/profile', authenticate, authorize, updateUserData)


export default router