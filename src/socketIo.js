import express from 'express';
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import { AUTH_EVENT, A_ADMIN_HAS_DELETED_YOU_CHAT_EVENT, A_PARTICIPANT_CHANGED_TO_ROLE_EVENT, A_PARTICIPANT_DELETED_BY_ADMIN_CHAT_EVENT, A_PARTICIPANT_JOINED_THE_CONTACT_CHAT_EVENT, A_PARTICIPANT_JOINED_THE_GROUP_CHAT_EVENT, A_PARTICIPANT_LEFT_THE_GROUP_CHAT_EVENT, A_PARTICIPANT_UNJOINED_TO_CONTACT_CHAT_EVENT, A_PARTICIPANT_UNJOINED_TO_GROUP_CHAT_EVENT, BLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT, CONTACT_MESSAGE_EVENT, CONTACT_NOTIFICATION_MESSAGE_EVENT, DELETION_EXECUTED_BY_USER_TO_CONTACT_EVENT, GET_USER_SOCKET_ID_EVENT, GROUP_MESSAGE_EVENT, GROUP_NOTIFICATION_MESSAGE_EVENT, IS_CONTACT_IN_THE_RECENT_MESSAGES_AREA_EVENT, NEW_GROUP_MEMBER_EVENT, NOTIFICATION_MESSAGE_EVENT, UNLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT,  USER_IS_ONLINE_EVENT, } from './v1/const/socketIoConst.js'
import { CreateANewMessage, GetDataOfToken, UpdateUserSocketId, CreateNewNotificationForContact, CreateNewNotificationForGroup, UpdateSocketIdOfUser, UpdateChatParticipantStatus, GetContactListOfUser } from './v1/utils/index.js';
import { ConvertDateToDayFormat, ConvertDateToHourFormat } from './v1/helpers/index.js';
import { FRONTEND_URL } from './configEnv.js';
export const app = express()

export const server = http.createServer(app)


const optionsIo = {
    cors: {
        origin: [FRONTEND_URL, "https://www.chatify.juanprodprojects.pro:3003", "https://www.chatify.juanprodprojects.pro:3003/socket.io", "http://localhost:3003/socket.io"]
    }
}



const io = new SocketServer(server, optionsIo)


export const socket = io.on('connection', (socket) => {
    console.log(`a user connected con id ${socket.id}`)
    // console.log(socket)
    console.log(socket.rooms)
    console.log(socket.rooms.size)


    // ******** SOCKET PARA MENSAGES EN GRUPO ***********/
    socket.on(GROUP_MESSAGE_EVENT, async (message) => {

        // ******** Registrar mensajes en la db ********
        const messageData = {
            message_id: message.message_id,
            chat_id: message.chat_id,
            user_id: message.user_id,
            message_content: message.message_content,
            timestamp: message.timestamp,
            is_read: message.is_read,
            read_timestamp: message.read_timestamp,
            message_type: message.message_type
        }

        // Funcion para registrar el mensaje entrante en la base de datos   
        const resultOfMessageRegistered = await CreateANewMessage(messageData)

        //aqui mostramos un error y salimos de flujo de en el caso de que el registro del mensaje en la base de datos no se logro
        if (resultOfMessageRegistered.status === "FAILED") {
            console.log(resultOfMessageRegistered.data.error)
            return
        }


        // ******** Envio de mensajes ********


        // aqui volvemos los valores de formato Date a string para que diga el dia y la hora exacta de l mensaje 
        const creationDateOfMessage = message.timestamp

        const creationHourOfMessage = ConvertDateToHourFormat(creationDateOfMessage)

        const creationDayOfMessage = ConvertDateToDayFormat(creationDateOfMessage)



        const messageObjectToView = {
            message_id: message.message_id, //aqui le agregamos message id para que cuando llegue a la vista y queramos seleccionarlo, obtengamos directamente su id del mensaje, de esta forma obtendriamos el id directo, para borrar el mensaje en que de que quisieramos
            chat_id: message.chat_id,
            group_id: message.group_id,
            user_id: message.user_id,
            username: message.username,
            timestamp: message.timestamp,
            date: creationDayOfMessage,
            hour: creationHourOfMessage,
            message_content: message.message_content,
            message_type: message.message_type,
            profile_picture: message.profile_picture,
            chat_type: message.chat_type
        }


        socket.to(`chat${message.chat_id}`).emit(GROUP_MESSAGE_EVENT, messageObjectToView)



    })


    // ******** SOCKET PARA MENSAGES ENTRE CONTACTOS ***********/
    socket.on(CONTACT_MESSAGE_EVENT, async (message) => {

        // ******** Registrar mensajes en la db ********


        console.log(`numero de rooms de evento Contact: ${socket.rooms.size}: ${socket.rooms}  `)

        const messageData = {
            message_id: message.message_id,
            chat_id: message.chat_id,
            user_id: message.user_id,
            message_content: message.message_content,
            timestamp: message.timestamp,
            is_read: message.is_read,
            read_timestamp: message.read_timestamp,
            message_type: message.message_type
        }


        // Funcion para registrar el mensaje entrante en la base de datos 
        const resultOfMessageRegistered = await CreateANewMessage(messageData)

        //  aqui mostramos un error y salimos de flujo de en el caso de que el registro del mensaje en la base de datos no se logro
        if (resultOfMessageRegistered === "FAILED") {
            console.log(resultOfMessageCreating.data.error)
            return
        }


        // ******** Envio de mensajes ********


        // aqui volvemos los valores de formato Date a string para que diga el dia y la hora exacta de l mensaje 
        const creationDateOfMessage = message.timestamp

        const creationHourOfMessage = ConvertDateToHourFormat(creationDateOfMessage)

        const creationDayOfMessage = ConvertDateToDayFormat(creationDateOfMessage)



        const messageObjectToView = {
            message_id: message.message_id, //aqui le agregamos message id para que cuando llegue a la vista y queramos seleccionarlo, obtengamos directamente su id del mensaje, de esta forma obtendriamos el id directo, para borrar el mensaje en que de que quisieramos
            chat_id: message.chat_id,
            user_id: message.user_id,
            username: message.username,
            timestamp: message.timestamp,
            date: creationDayOfMessage,
            hour: creationHourOfMessage,
            message_content: message.message_content,
            profile_picture: message.profile_picture,
            message_type: message.message_type,
            chat_type: message.chat_type,
            is_current_user_messsage: message.is_current_user_messsage
        }

        socket.to(`chat${message.chat_id}`).emit(CONTACT_MESSAGE_EVENT, messageObjectToView)

    })

    // ******** SOCKET PARA RECIVIR Y GUARDAR EL SOCKETID EN EL REGISTRO DEL USUARIO  ***********/ 
    socket.on(GET_USER_SOCKET_ID_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }


        console.log('se esta ejecutando el evento GET_USER_SOCKET_ID_EVENT ')

        // aqui estamos actualizando el valor de la columna socketid de usario en la db
        const resultOfUpdateUserSocketId = await UpdateUserSocketId(userId, socket.id)



        console.log(resultOfUpdateUserSocketId)
        //  aqui si emitimos el resultado de la actualizacion del valor de su socketid del usuario en la base de datos 
        io.to(socket.id).emit(GET_USER_SOCKET_ID_EVENT, resultOfUpdateUserSocketId)

        const contactList = await GetContactListOfUser(userId)


        const contactListObtained = contactList.data.contactList

        console.log(contactListObtained)

        if (contactListObtained) {

            contactListObtained.forEach((contact) => {
                console.log('se emitio un evento para el contacto del usuario')

                socket.to(contact.contact_user.socket_id).emit(USER_IS_ONLINE_EVENT)

            })

        }

    })




    // ******** SOCKET PARA EL ESTATUS A ACTIVO DE UN PARTICIPANTE EN UN GROUP CHAT ***********/
    socket.on(A_PARTICIPANT_JOINED_THE_GROUP_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.join(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms} `)

        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_JOINED_THE_GROUP_CHAT_EVENT, { chat_id: body.chatId })

    })



    // ******** SOCKET PARA EL ESTATUS A INACTIVO DE UN PARTICIPANTE EN UN GROUP CHAT ***********/
    socket.on(A_PARTICIPANT_UNJOINED_TO_GROUP_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.leave(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms}  `)

        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_UNJOINED_TO_GROUP_CHAT_EVENT, { chat_id: body.chatId })

    })



    // ******** SOCKET PARA EL ESTATUS A ACTIVO DE UN PARTICIPANTE EN UN CONTACT CHAT ***********/
    socket.on(A_PARTICIPANT_JOINED_THE_CONTACT_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.join(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms} `)


        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_JOINED_THE_CONTACT_CHAT_EVENT, { chat_id: body.chatId, contact_user_id: userId })

    })


    // ******** SOCKET PARA EL ESTATUS A INACTIVO DE UN PARTICIPANTE EN UN CONTACT CHAT ***********/
    socket.on(A_PARTICIPANT_UNJOINED_TO_CONTACT_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.to(body.contactSocketId).emit(A_PARTICIPANT_UNJOINED_TO_CONTACT_CHAT_EVENT, { chat_id: body.chatId, contact_user_id: userId })

        socket.leave(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms}  `)

    })




    socket.on(A_PARTICIPANT_LEFT_THE_GROUP_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        //aqui estamos enviando el evento de que el miembro con id = body.userId, se retiro del grupo y en la logica del cliente se estara actualizando la lista de miembros del grupo pero sin el miembro que se retiro voluntarimento 
        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_LEFT_THE_GROUP_CHAT_EVENT, { chat_id: body.chatId, member_id_Left: body.userId })

        // aqui retiramos la conexion socket de la room del chat de grupo para que el miembro recien retirado no pueda escuchar mas los eventos de la sala
        socket.leave(`chat${body.chatId}`)


    })

    socket.on(A_PARTICIPANT_DELETED_BY_ADMIN_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }


        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_DELETED_BY_ADMIN_CHAT_EVENT, { chat_id: body.chatId, member_id: body.memberIdDeleted })



    })

    socket.on(A_ADMIN_HAS_DELETED_YOU_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        // aqui estamos haciendo que el miembro que elimino el admin del chat se retire de la room posi mismo, esto gracias a que en el cliente se hizo un filtro previo para que este evento A_ADMIN_HAS_DELETED_YOU_CHAT_EVENT solo lo emitiera el miembro que fue   
        socket.leave(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms}  `)


    })


    socket.on(A_PARTICIPANT_CHANGED_TO_ROLE_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }


        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_CHANGED_TO_ROLE_EVENT, { member_id: body.memberIdConvertedToAdmin })

    })



    // ******** SOCKET PARA MENSAGES ENTRE CONTACTOS ***********/
    socket.on(NEW_GROUP_MEMBER_EVENT, async (dataRecived) => {
        const dataForClient = {
            group_id: dataRecived.group_id,
            chat_id: dataRecived.chat_id,
            user_id: dataRecived.user_id
        }

        console.log(dataForClient)


        // socket.join(`chat${dataRecived.chatId}`)

        socket.to(`chat${dataRecived.chat_id}`).emit(NEW_GROUP_MEMBER_EVENT, dataForClient)

        // socket.leave(`chat${dataRecived.chatId}`)

    })





    // ******** SOCKET PARA CREAR Y NOTIFICAR AL USUARIO SOBRE SUS NUEVA NOTIFICACIONES DE GRUPO ***********/
    socket.on(GROUP_NOTIFICATION_MESSAGE_EVENT, async (body) => {

        const { socketId, messageId, userId, chatId, creatorProfilePicture, creatorUserId, creatorUserName, groupId, type, chatType, message, status } = body

        if (!body.socketId) {
            console.log('el usurio no fue encontrado')
            return
        }

        console.log(socketId, messageId, userId, chatId, creatorProfilePicture, creatorUserId, groupId, type, chatType, message, status)



        const currentNotificationData = {
            message_id: messageId,
            participant_id: userId,
            chat_id: chatId,
            creator_profile_picture: creatorProfilePicture,
            creator_user_id: creatorUserId,
            creator_userName: creatorUserName,
            group_id: groupId,
            chat_type: chatType,
            type: type,
            message: message,
            status: status,
        }

        // aqui estamos actualizando el valor de la columna socketid de usario en la db
        const resultOfCreateNotification = await CreateNewNotificationForGroup(currentNotificationData)



        //  aqui si emitimos el resultado de la actualizacion del valor de su socketid del usuario en la base de datos 
        if (resultOfCreateNotification) {
            const dataToSend = {
                groupId: groupId, 
                userNotificiationsList: resultOfCreateNotification.data.user_notifications,
                currentNotificationData: currentNotificationData
            }

            socket.to(socketId).emit(GROUP_NOTIFICATION_MESSAGE_EVENT, dataToSend)

        }

    })


    // ******** SOCKET PARA CREAR Y NOTIFICAR AL USUARIO SOBRE SUS NUEVA NOTIFICACIONES DE CONTACTO ***********/
    socket.on(CONTACT_NOTIFICATION_MESSAGE_EVENT, async (body) => {

        const { socketId, messageId, userId, chatId, creatorProfilePicture, creatorUserId, creatorUserName, type, chatType, message, status, wasUserDeletedByHisContact } = body

        if (!body.socketId) {
            console.log('el usurio no fue encontrado')
            return
        }

        console.log(socketId, messageId, userId, chatId, creatorProfilePicture, creatorUserId, type, chatType, message, status, wasUserDeletedByHisContact)



        const currentNotificationData = {
            message_id: messageId,
            participant_id: userId,
            chat_id: chatId,
            creator_profile_picture: creatorProfilePicture,
            creator_user_id: creatorUserId,
            creator_userName: creatorUserName,
            chat_type: chatType,
            type: type,
            message: message,
            status: status,
            wasUserDeletedByHisContact: wasUserDeletedByHisContact
        }

        // aqui estamos actualizando el valor de la columna socketid de usario en la db
        const resultOfCreateNotification = await CreateNewNotificationForContact(currentNotificationData)



        //  aqui si emitimos el resultado de la actualizacion del valor de su socketid del usuario en la base de datos 
        if (resultOfCreateNotification) {
            const dataToSend = {
                userNotificiationsList: resultOfCreateNotification.data.user_notifications,
                currentNotificationData: currentNotificationData
            }

            socket.to(socketId).emit(CONTACT_NOTIFICATION_MESSAGE_EVENT, dataToSend)

        }

    })


    socket.on(BLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.to(`chat${body.chatId}`).emit(BLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT, { chat_id: body.chatId, contact_user_id: userId })


    })


    socket.on(UNLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.to(`chat${body.chatId}`).emit(UNLOCK_EXECUTED_BY_USER_TO_CONTACT_EVENT, { chat_id: body.chatId, contact_user_id: userId })

    })

    
    socket.on(DELETION_EXECUTED_BY_USER_TO_CONTACT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.to(body.contact_user_socket_id).emit(DELETION_EXECUTED_BY_USER_TO_CONTACT_EVENT, { chat_id: body.chatId, contact_user_id: userId  })

        socket.leave(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms}  `)

    })


    socket.on(IS_CONTACT_IN_THE_RECENT_MESSAGES_AREA_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.to(`chat${body.chatId}`).emit(IS_CONTACT_IN_THE_RECENT_MESSAGES_AREA_EVENT, { chat_id: body.chatId, is_contact_in_recent_messages_area: body.is_user_in_recent_messages_area })

    })



    // return socket.on("disconnect")
    // return socket.disconnect(true)
    // return io.on("disconnect")
    // return socket.disconnected()

    socket.on('disconnect', async () => {


        // 1)
        // ************ aqui otenemos el chatId del chat donde se encuentra el usuario antes de la desconexion y su lista de contactos *************

        const dataObtained = await UpdateChatParticipantStatus(socket.id)
        // console.log(dataObtained)

        const dataForEmitions = dataObtained.data

        const contactsListObtained = dataForEmitions.contactList

        console.log(contactsListObtained)




        // aqui no unimos a un chat de grupo, porsiacaso el usuario se encuentre en uno, y en la vista de los miembros se actualize que se ah desconectado 
        if (dataForEmitions.chatId !== 'empty') {

            socket.join(`chat${dataForEmitions.chatId}`)

            socket.to(`chat${dataForEmitions.chatId}`).emit(A_PARTICIPANT_UNJOINED_TO_GROUP_CHAT_EVENT, { chat_id: dataForEmitions.chatId })

            socket.to(`chat${dataForEmitions.chatId}`).emit(IS_CONTACT_IN_THE_RECENT_MESSAGES_AREA_EVENT, { chat_id: dataForEmitions.chatId, is_contact_in_recent_messages_area: false })
        }


        // 2)
        // ************ aqui pasamos el socket id del usuario a empty *************
        await UpdateSocketIdOfUser('empty', socket.id)



        // 3)
        // ************ aqui emitimos un eventos a todos los contactos de la lista del usuario, para que en la vista de los contactos aparesca como offline *************  
        if (contactsListObtained) {

            contactsListObtained.forEach((contact) => {
                console.log('se emitio un evento para el contacto del usuario')

                socket.to(contact.contact_user.socket_id).emit(A_PARTICIPANT_UNJOINED_TO_CONTACT_CHAT_EVENT, { chat_id: contact.chat_id, contact_user_id: contact.user_id })

            })

        }




        // aqui tenemos que implementar logica para actualizar el estatus del usuario de cualquir chat de grupo o contact a invactivo y actualizar a emty la columna de sokcet_io del usuario
        console.log(`esta conexion socket se acaba de desconectar a todas las salas de la que formaba parte y luego se elimino con el id: ${socket.id} `)
    })
})



