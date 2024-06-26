import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'
import notificationsService from "../services/notificationsService.js";



export const getNotificacions =  async (req, res) => {

    const { userId } = req.user
    

    // 1)
    const sqlForGetAllNotifications = 'SELECT * FROM notifications WHERE user_id = $1'

    try {

        // 1)
        // ************ Creacion de chat *************

        const userData = [userId]
       
        
        const allNotificationsObtained = await  notificationsService.getNotificacions(sqlForGetAllNotifications, userData) 
    
     
        const data = {
            notifications_list: allNotificationsObtained
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint GET /notifications:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}


export const getAllNotifications = async (req, res) => {

    const { userId } = req.user
    const { chat_id } = req.query


    // 1)
    const sqlForGetAllNotifications = 'SELECT * FROM notifications WHERE user_id = $1 AND chat_id = $1'


    try {

        // 1)
        // ************ Creacion de chat *************

        const chatData = [userId, chat_id]

        const allNotificationsObtained = await  notificationsService.getAllNotifications(sqlForGetAllNotifications, chatData) 
     
        const data = {
            notifications_list: allNotificationsObtained
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint GET /notifications:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}


export const saveGroupNotifications = async (req, res) => {

    const { message_id, user_id, chat_id, group_id, type, chat_type, message, status } = req.body


    // 1)
    const sqlForCreateNotification = 'INSERT INTO notifications(notification_id, message_id, user_id, chat_id, group_id, type, chat_type, message, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)'



    try {

        if (!message_id || !user_id || !chat_id ||!group_id || !type || !chat_type || !message || !status) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        const notification_id = uuidv4()

        // 1)
        // ************ Creacion de chat *************


        const chatDataForRegister = [notification_id, message_id, user_id, chat_id, group_id, type, chat_type, message, status]

        await notificationsService.saveGroupNotifications(sqlForCreateNotification, chatDataForRegister) 
     

        const data = {
            notification_id: notification_id
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /notifications:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}



export const saveContactNotificaciones = async (req, res) => {

    const { message_id, user_id, chat_id, type, chat_type, message, status } = req.body


    // 1)
    const sqlForCreateNotification = 'INSERT INTO notifications(notification_id, message_id, user_id, chat_id, type, chat_type, message, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'



    try {

        if (!message_id || !user_id || !chat_id || !type || !chat_type || !message || !status) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        const notification_id = uuidv4()

        // 1)
        // ************ Creacion de chat *************


        const chatDataForRegister = [notification_id, message_id, user_id, chat_id, type, chat_type, message, status]

        
        await notificationsService.saveContactNotifications(sqlForCreateNotification, chatDataForRegister) 
     

        const data = {
            notification_id: notification_id
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /notifications:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}

export const deleteNotifications = async (req, res) => {

    const {messageId} = req.query

    // 1)
    const sqlForDeleteNotification = 
    'DELETE FROM notifications WHERE message_id = $1'

    try {

        if (!messageId) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        // 1)
        // ************ Eliminacion de notificaciones *************

        const notificationDataForDetele = [messageId]


        await notificationsService.deleteNotifications(sqlForDeleteNotification, notificationDataForDetele) 
        
        
        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /groups:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}


export const deleteAllNotifications = async (req, res) => {

    const {userId} = req.user
    const {chat_id} = req.query

    // 1)
    const sqlForDeleteNotifications = 
    'DELETE FROM notifications WHERE user_id = $1 AND chat_id = $2'

    try {

        if (!chat_id) {
            throw { status: 400, message: `Please complete all required fields.` }
        }

        // 1)
        // ************ Elminacion de notificaciones de chat *************


        const notificationDataForDetele = [userId, chat_id]

        await notificationsService.deleteAllNotifications(sqlForDeleteNotifications, notificationDataForDetele) 
        
        
        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /groups:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}