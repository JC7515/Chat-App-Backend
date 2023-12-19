import express from 'express';
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import { AUTH_EVENT, A_PARTICIPANT_JOINED_THE_CHAT_EVENT, A_PARTICIPANT_UNJOINED_TO_CHAT_EVENT, CONTACT_MESSAGE_EVENT, GET_USER_SOCKET_ID_EVENT, GROUP_MESSAGE_EVENT, NEW_GROUP_MEMBER_EVENT, NOTIFICATION_MESSAGE_EVENT, } from './v1/const/socketIoConst.js'
import { CreateANewMessage, GetDataOfToken, CreateNewNotification, UpdateUserSocketId } from './v1/utils/index.js';
import { ConvertDateToDayFormat, ConvertDateToHourFormat } from './v1/helpers/index.js';
export const app = express()

export const server = http.createServer(app)


const optionsIo = {
    cors: {
        origin: 'http://localhost:3000'
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

        //  aqui mostramos un error y salimos de flujo de en el caso de que el registro del mensaje en la base de datos no se logro
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
            user_id: message.user_id,
            username: message.username,
            timestamp: message.timestamp,
            date: creationDayOfMessage,
            hour: creationHourOfMessage,
            message_content: message.message_content,
            profile_image: '',
            message_type: message.message_type
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
            profile_image: '',
            message_type: message.message_type
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

        // aqui estamos actualizando el valor de la columna socketid de usario en la db
        const resultOfUpdateUserSocketId = await UpdateUserSocketId(userId, socket.id)

        console.log(resultOfUpdateUserSocketId)
        //  aqui si emitimos el resultado de la actualizacion del valor de su socketid del usuario en la base de datos 
        io.to(socket.id).emit(GET_USER_SOCKET_ID_EVENT, resultOfUpdateUserSocketId)

    })





    socket.on(A_PARTICIPANT_JOINED_THE_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.join(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms} `)

        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_JOINED_THE_CHAT_EVENT, { chat_id: body.chatId })

    })


    socket.on(A_PARTICIPANT_UNJOINED_TO_CHAT_EVENT, async (body) => {

        const { userId } = GetDataOfToken(body.authToken)

        if (!userId) {
            console.log('el usurio no fue encontrado')
            return
        }

        socket.leave(`chat${body.chatId}`)
        console.log(`numero de rooms de evento Auth: ${socket.rooms.size}: ${socket.rooms}  `)

        socket.to(`chat${body.chatId}`).emit(A_PARTICIPANT_UNJOINED_TO_CHAT_EVENT, { chat_id: body.chatId })

    })



    // ******** SOCKET PARA MENSAGES ENTRE CONTACTOS ***********/
    socket.on(NEW_GROUP_MEMBER_EVENT, async (dataRecived) => {
        const dataForClient = {
            group_id: dataRecived.group_id,
            chat_id: dataRecived.chat_id,
            user_id: dataRecived.user_id
        }

        console.log(dataForClient)


        socket.join(`chat${dataRecived.chatId}`)

        socket.to(`chat${dataRecived.chat_id}`).emit(NEW_GROUP_MEMBER_EVENT, dataForClient)

        socket.leave(`chat${dataRecived.chatId}`)

    })




    // ******** SOCKET PARA CREAR Y NOTIFICAR AL USUARIO SOBRE SUS NUEVA NOTIFICACIONES ***********/
    socket.on(NOTIFICATION_MESSAGE_EVENT, async (body) => {

        const { socketId, messageId, userId, chatId, groupId, type, message, status } = body

        if (!body.socketId) {
            console.log('el usurio no fue encontrado')
            return
        }

        console.log(socketId, messageId, userId, chatId, groupId, type, message, status)

        // aqui estamos actualizando el valor de la columna socketid de usario en la db
        const resultOfCreateNotification = await CreateNewNotification(messageId, userId, chatId, groupId, type, message, status)

        //  aqui si emitimos el resultado de la actualizacion del valor de su socketid del usuario en la base de datos 
        if (resultOfCreateNotification) {
            const dataToSend = { groupId: groupId, userNotificiationsList: resultOfCreateNotification.data.user_notifications }

            socket.to(socketId).emit(NOTIFICATION_MESSAGE_EVENT, dataToSend)

        }

    })


    // return socket.on("disconnect")
    // return socket.disconnect(true)
    // return io.on("disconnect")
    // return socket.disconnected()

    socket.on('disconnect', () => {
        console.log(`esta conexion socket se acaba de desconectar a todas las salas de la que formaba parte y luego se elimino con el id: ${socket.id} `)
    })
})



