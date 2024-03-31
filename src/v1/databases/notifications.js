import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { v4 as uuidv4 } from 'uuid'



const getNotificacions = async (sqlForGetAllNotifications, userData) => {

    try {

        // 1)
        // ************ Creacion de chat *************

        const resultOfGetAllNotifications = await connection.query(sqlForGetAllNotifications, userData)


        let allNotificationsObtained = resultOfGetAllNotifications.rows

        if (resultOfGetAllNotifications.rows.length === 0) {
            console.log('la propiedad rows indica que no se encontraron notificaciones')
            allNotificationsObtained = []
        }


        return allNotificationsObtained


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


const getAllNotifications = async (sqlForGetAllNotifications, chatData) => {

    try {


        // 1)
        // ************ Creacion de chat *************

        const resultOfGetAllNotifications = await connection.query(sqlForGetAllNotifications, chatData)


        let allNotificationsObtained = resultOfGetAllNotifications.rows

        if (resultOfGetAllNotifications.rows.length === 0) {
            console.log('la propiedad rows indica que no se encontraron notificaciones')
            allNotificationsObtained = []
        }


        return allNotificationsObtained


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


const saveGroupNotifications = async (sqlForCreateNotification, chatDataForRegister) => {

    try {


        // 1)
        // ************ Creacion de chat *************

        const resultNotificationCreation = await connection.query(sqlForCreateNotification, chatDataForRegister)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



const saveContactNotificaciones = async (sqlForCreateNotification, chatDataForRegister) => {

    try {

        // 1)
        // ************ Creacion de chat *************

        const resultNotificationCreation = await connection.query(sqlForCreateNotification, chatDataForRegister)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }


        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}

const deleteNotifications = async (sqlForDeleteNotification, notificationDataForDetele) => {

    try {

        // 1)
        // ************ Eliminacion de notificaciones *************


        const resultNotificationCreation = await connection.query(sqlForDeleteNotification, notificationDataForDetele)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que la notificacion no se elimino con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


const deleteAllNotifications = async (sqlForDeleteNotifications, notificationDataForDetele) => {

    try {

        // 1)
        // ************ Elminacion de notificaciones de chat *************

        const resultNotificationCreation = await connection.query(sqlForDeleteNotifications, notificationDataForDetele)


        if (resultNotificationCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que no habia notificacion para eliminar con exito')
            // throw { status: 500, message: `An error occurred, try again` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



export default { getNotificacions, getAllNotifications, saveGroupNotifications, saveContactNotificaciones, deleteNotifications, deleteAllNotifications }