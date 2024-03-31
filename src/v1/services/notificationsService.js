import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'
import notifications from "../databases/notifications.js";



const getNotificacions = async (sqlForGetAllNotifications, userData) => {

    try {

        const result = await notifications.getNotificacions(sqlForGetAllNotifications, userData)

        return result


    } catch (error) {
        throw error
    }
}


const getAllNotifications = async (sqlForGetAllNotifications, chatData) => {

    try {


        const result = await notifications.getAllNotifications(sqlForGetAllNotifications, chatData)

        return result


    } catch (error) {
        throw error
    }
}


const saveGroupNotifications = async (sqlForCreateNotification, chatDataForRegister) => {

    try {


        const result = await notifications.saveGroupNotifications(sqlForCreateNotification, chatDataForRegister)

        return result



    } catch (error) {
        throw error
    }
}



const saveContactNotifications = async (sqlForCreateNotification, chatDataForRegister) => {

    try {


        const result = await notifications.saveContactNotificaciones(sqlForCreateNotification, chatDataForRegister)

        return result


    } catch (error) {
        throw error
    }
}

const deleteNotifications = async (sqlForDeleteNotification, notificationDataForDetele) => {

    try {

        const result = await notifications.deleteNotifications(sqlForDeleteNotification, notificationDataForDetele)

        return result


    } catch (error) {
        throw error
    }
}


const deleteAllNotifications = async (sqlForDeleteNotifications, notificationDataForDetele) => {

    try {

        const result = await notifications.deleteAllNotifications(sqlForDeleteNotifications, notificationDataForDetele)

        return result

    } catch (error) {
        throw error
    }
}


export default { getNotificacions, getAllNotifications, saveGroupNotifications, saveContactNotifications, deleteNotifications, deleteAllNotifications }