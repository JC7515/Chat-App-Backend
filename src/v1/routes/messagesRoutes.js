import express from "express";
import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { GetCurrentDateString } from "../helpers/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";


const router = express.Router()



// GET /group/messages/?chatId={chatId}&messagesLimit={messagesLimit}&creationDate={creationDate}
router.get('/group/messages', authenticate, authorize, async (req, res) => {


    const { userId } = req.user
    const { chatId, messagesLimit, creationDate } = req.query

    // console.log(userId, chatId)

    try {


        console.log(chatId, messagesLimit, creationDate)
        if (!chatId || !messagesLimit || !creationDate) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }

        // const sql = 'SELECT * FROM messages WHERE chat_id = $1'
        const sql = 'SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY'

        // const chatData = [chatId]
        const chatData = [chatId, creationDate, 0, messagesLimit]


        const resultOfGetMessages = await connection.query(sql, chatData)


        const messagesList = resultOfGetMessages.rows.reverse()

        // console.log(messagesList)

        let messageListWithUserData = []

        if (messagesList.length > 0) {
            messageListWithUserData = await Promise.all(
                messagesList.map(async (message) => {

                    const sql = 'SELECT * FROM users WHERE user_id = $1'

                    const userDataForSql = [message.user_id]


                    const userData = await connection.query(sql, userDataForSql)

                    const userDataObtained = userData.rows[0]

                    const profilePictureUrl = await GetFileUrl(userDataObtained.profile_picture, 88000)

                    return {
                        ...message,
                        user_data: {
                            user_id: userDataObtained.user_id,
                            username: userDataObtained.username,
                            profile_picture: profilePictureUrl
                        }
                    }

                })
            )

        }




        // console.log(messageListWithUserData)

        const data = {
            messages: messageListWithUserData
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})




// GET /contact/messages/?chatId={chatId}&messagesLimit={messagesLimit}&creationDate={creationDate}
router.get('/contact/messages', authenticate, authorize, async (req, res) => {


    const { userId } = req.user
    const { chatId, messagesLimit, creationDate } = req.query

    // console.log(userId, chatId)

    try {


        console.log(chatId, messagesLimit, creationDate)
        if (!chatId || !messagesLimit || !creationDate) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }

        // aqui tendriamos que agregar logica para extraer las fechas en la cuales un usuario bloqueo a otro usuario y solo extraer los mensajes del chat en que el usuario bloqueado no fue bloqueado por el otro usuario  

        // 1)
        const sqlForGetChatParticipants = 'SELECT chat_id, user_id FROM chat_participants WHERE chat_id = $1'




        const DataForGetChatParticipants = [chatId]

        // query para obtener los datos de la db
        const resultOfGetChatParticipants = await connection.query(sqlForGetChatParticipants, DataForGetChatParticipants)


        const ChatParticipantsObtained = resultOfGetChatParticipants.rows

        // console.log(ChatParticipantsObtained)

        // aqui validamos y filtramos cual es el userid del otro participante del chat   

        const userIdOfTheOtherParticipant = ChatParticipantsObtained.find((participant) => participant.user_id !== userId)



        // 1)
        // ************* Case 1 **************/
        // ************* aqui obtenemos el historial de de bloqueos del cada usuario del chats **************/
        const sqlForGetBlocksOfParticipants = 'SELECT * FROM blocks WHERE chat_id = $1'


        const DataForGetBlocks = [chatId]

        // aqui obtenemos todos los block de cada participante del chat, para luego filtrarlos y separarlos mas abajo
        const resultOfGetAllBlocks = await connection.query(sqlForGetBlocksOfParticipants, DataForGetBlocks)


        const allBlocksObtained = resultOfGetAllBlocks.rows


        // aqui filtramos los blocks de cada participante del chat y se los asignamos a cada uno

        const blocksOfThisUser = []
        const blocksOfTheOtherParticipant = []


        allBlocksObtained.forEach((block) => {
            if (block.blocker_user_id === userId) {
                blocksOfThisUser.push(block)
                return
            }

            if (block.blocker_user_id === userIdOfTheOtherParticipant.user_id) {
                blocksOfTheOtherParticipant.push(block)
                return
            }

            return
        })

        // console.log(blocksOfThisUser)
        // console.log(blocksOfTheOtherParticipant)

        // console.log(`la logitud del blocksOfThisUser es ${blocksOfThisUser.length}`)
        // console.log(`la logitud del blocksOfTheOtherParticipant es ${blocksOfTheOtherParticipant.length}`)



        // aqui estamos agregando un block en el caso de que el usuario o el contacto no tenga ningun block agregado, por que aun no valido al contacto que el envio el mensaje
        const blocksArray = [blocksOfThisUser, blocksOfTheOtherParticipant]

        blocksArray.forEach((blockArray) => {

            if (blockArray.length === 0) {
                const currentDate = new Date(GetCurrentDateString())
                const dateOneWeekAgo = new Date(currentDate.getDate() - 7)


                const blockInactive = {
                    status: 'inactive',
                    block_date: dateOneWeekAgo
                }

                blockArray.push(blockInactive)

                return
            }

            return
        })





        // 2)
        // ************* aqui obtenemos el historial de de veces que el usuario elimino todo los mensajes del chat, para utilizarlo como filtro al momento de obtener los mensajes y que solo obtengamos los mensajes que estan despues de la ultima fecha de eliminacion **************/

        const sqlForGetchathistoryDeletion =
            'SELECT * FROM chat_history_deletions WHERE user_id = $1 AND chat_id = $2'

        const GetchathistoryDeletionData = [userId, chatId]

        // query para obtener los datos de la db
        const resultOfGetchathistoryDeletion = await connection.query(sqlForGetchathistoryDeletion, GetchathistoryDeletionData)


        // aqui obtenemos el array de datos de la propiedad .rows que obtuvimos de la db
        const ChathistoryDeletionData = resultOfGetchathistoryDeletion.rows

        // aqui validamos si es que el array que nos devolvio es mayo a 0 elementos, para devolver el ultimo elemento de la lista que contiene la fecha de registro de la ultima vez que el usuario elimino todos los mensajes de un chat de contacto o si es igual a 0 elementos, devolvemos undefined, porque no se encontraron fechas
        const lastDateOfChathistoryDeletion = ChathistoryDeletionData.length > 0 ?
            (
                ChathistoryDeletionData[ChathistoryDeletionData.length - 1].deletion_date
            )
            :
            (undefined)

        // console.log(lastDateOfChathistoryDeletion)

        // 3)
        // ************* aqui obtenemos obtenemos los mensajes para que sean mostrados en la vista **************/


        // aqui validamos si lastDateOfChathistoryDeletion contiene un valor para asi filtra en la base de datos por medio de la fecha de creacion de los mensajes y tambien por la ultima fecha de eliminacion del historial de mensajes en el chat, y si es undefined solo filtramos por la fecha de creacion de los mensajes       
        const sql = lastDateOfChathistoryDeletion ? ('SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 AND timestamp > $3 ORDER BY timestamp DESC OFFSET $4 ROWS FETCH NEXT $5 ROWS ONLY')
            :
            ('SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY')

        // console.log(sql)

        // aqui hacemos la misma validacion que antes, solo para agregar el dato de la fecha de la ultima vez que se elimino los mensajes del chat
        const chatData = lastDateOfChathistoryDeletion ? ([chatId, creationDate, lastDateOfChathistoryDeletion, 0, messagesLimit])
            :
            ([chatId, creationDate, 0, messagesLimit])


        const resultOfGetMessages = await connection.query(sql, chatData)

        const messagesList = resultOfGetMessages.rows.reverse()

        // console.log(messagesList)

        // 1)
        // ************* aqui filtramos todos los mensajes que esten fuera de las fechas en la que el usuario hizo un bloqueo **************/



        // console.log(messagesList)
        let messageListWithUserData = []

        if (messagesList.length > 0) {

            // aqui agregamos un block active mas, en caso de que el ultimo bloqueo sea inactive, esto para que el filtro recoja todos los mensajes entre el block inactive y este active que se esta introduciendo 

            blocksArray.forEach((blockArray) => {

                if (blockArray[blockArray.length - 1].status === 'inactive') {
                    const stringDate = GetCurrentDateString()

                    const blockWithCurrentDate = {
                        status: 'active',
                        block_date: new Date(stringDate)
                    }

                    blockArray.push(blockWithCurrentDate)

                    return
                }

                if (blockArray[blockArray.length - 1].status === 'active') {
                    const stringDate = GetCurrentDateString()

                    const blockWithCurrentDate = {
                        status: 'inactive',
                        block_date: new Date(stringDate)
                    }

                    blockArray.push(blockWithCurrentDate)

                    return
                }


                return

            })



            console.log("se esta ejecutando logica para filtrar mensajes por fecha de bloqueos")



            // aqui validamos cual de los dos array de blocks de los participantes de chat es el man grnade para utilizarlo en el filtro de mensajes 
            const longestLockArray = blocksOfThisUser.length >
                blocksOfTheOtherParticipant.length ? blocksOfThisUser : blocksOfTheOtherParticipant

            // aqui validamos y extraemos cual de los dos array de blocks es el mas corto, para utulizarlo dentro del filtro de mensajes
            const shortestLockArray = blocksOfTheOtherParticipant.length <
                blocksOfThisUser.length ? blocksOfTheOtherParticipant : blocksOfThisUser

            // console.log(`la logitud del longestLockArray es ${longestLockArray.length}`)
            // console.log(`la logitud del shortestLockArray es ${shortestLockArray.length}`)

            // console.log(longestLockArray)
            // console.log(shortestLockArray)
            // console.log('*******************************************')




            // 1)
            // ************* aqui comparamos los blocks de cada array para obtener un unico array, para luego filtrarlo con los mensajes mas abajo  **************/

            const locksListToFilter = []

            let isFoundOneValueUndifined = false

            longestLockArray.forEach((block, index) => {

                const blockOfLongestArray = longestLockArray[index]


                const blockOfShortestArray = shortestLockArray[index]

                // console.log(blockOfLongestArray)
                // console.log(blockOfShortestArray)



                // aqui obtenemos todos los bloqueos restantes que tiene el array de blockOfLongestArray, despues de que en el blockOfShortestArray, ya no queden mas blocks para comparar
                if (!isFoundOneValueUndifined && blockOfLongestArray.status === 'inactive' && !blockOfShortestArray) {

                    isFoundOneValueUndifined = true

                    const restOfLocks = longestLockArray.filter((locks, indexFilter) => indexFilter > index)


                    // en caso de que no haya ningunos blocks restante, se procedera a agrega el ultimo block inactive 
                    if (restOfLocks.length === 0) {

                        locksListToFilter.push(blockOfLongestArray)

                        return
                    }


                    // aqui agregamos el resto de los blocks que quedan en el longestArray y aplicamos un operador spreed, para que los blocks restantes se pasen como objetos y no dentro de un array como lo devuelve el filter
                    locksListToFilter.push(...restOfLocks)


                    return
                }


                // aqui obtenemos todos los bloqueos restantes que tiene el array de blockOfLongestArray, despues de que en el blockOfShortestArray, ya no queden mas blocks para comparar  
                if (!isFoundOneValueUndifined && blockOfLongestArray.status === 'active' && !blockOfShortestArray) {

                    // aqui se pasa a true el valor de isFoundOneValueUndifined para que ninguna logica de condicional se ejecute en la proxima iteracion 
                    isFoundOneValueUndifined = true


                    // aqui obtenemos todos los blocks restantes en el array longestLockArray despues de este indice 
                    const restOfLocks = longestLockArray.filter((locks, indexFilter) => indexFilter > index)


                    // en caso de que no haya ningunos blocks restante, se procedera a agrega el ultimo block active  
                    if (restOfLocks.length === 0) {

                        locksListToFilter.push(blockOfLongestArray)

                        return
                    }

                    // aqui agregamos el resto de los blocks que quedan en el longestArray y aplicamos un operador spreed, para que los blocks restantes se pasen como objetos y no dentro de un array como lo devuelve el filter 
                    locksListToFilter.push(...restOfLocks)


                    return
                }


                // aqui obtenemos el bloqueo active con la fecha mas baja de los dos blocks de cada partticipante de chat de contacto
                if (!isFoundOneValueUndifined && blockOfLongestArray.status === 'inactive' && blockOfShortestArray.status === 'inactive') {

                    // ******* Si algunos de los blocks no cuenta block_id este logica de la condicion no se ejecuta y se procede a buscar el unico block inactive que tenga id, para almecenarlos en el array final de filtrado****

                    // aqui validamos que los dos blocks cuente con su propiedad block_id, para poder diferenciar de los block creados por el usuario y los block si block_id creado para rellenar, asi evitamos que se compare una fecha antigua y una fecha actual recien creado y que se extraiga esta fecha invalida, en vez de la valida, asi provocando de que no se filtre bien los mensajes bloqueados del contacto
                    if (blockOfLongestArray.block_id && blockOfShortestArray.block_id) {

                        const blockWithShorterDate = blockOfLongestArray.block_date > blockOfShortestArray.block_date ? blockOfLongestArray : blockOfShortestArray

                        locksListToFilter.push(blockWithShorterDate)

                        return
                    }

                    // aqui obtenemos el unico block con id valido, para agregarlo al array final de filtrado 
                    const blockWithBlockId = blockOfLongestArray.block_id ? blockOfLongestArray : blockOfShortestArray

                    locksListToFilter.push(blockWithBlockId)

                    return

                }


                // aqui obtenemos el bloqueo inactive con la fecha mas alta de los dos blocks de cada partticipante de chat de contacto
                if (!isFoundOneValueUndifined && blockOfLongestArray.status === 'active' && blockOfShortestArray.status === 'active') {

                    // ******* Si algunos de los blocks no cuenta block_id este logica de la condicion no se ejecuta y se procede a buscar el unico block active que tenga id, para almecenarlos en el array final de filtrado****  

                    // aqui validamos que los dos blocks cuente con su propiedad block_id, para poder diferenciar de los block creados por el usuario y los block si block_id creado para rellenar, asi evitamos que se compare una fecha antigua y una fecha actual recien creado y que se extraiga esta fecha invalida, en vez de la valida, asi provocando de que no se filtre bien los mensajes bloqueados del contacto
                    if (blockOfLongestArray.block_id && blockOfShortestArray.block_id) {

                        const blockWithLongestDate = blockOfLongestArray.block_date < blockOfShortestArray.block_date ? blockOfLongestArray : blockOfShortestArray

                        locksListToFilter.push(blockWithLongestDate)

                        return
                    }

                    // aqui obtenemos el unico block con id valido, para agregarlo al array final de filtrado 
                    const blockWithBlockId = blockOfLongestArray.block_id ? blockOfLongestArray : blockOfShortestArray

                    locksListToFilter.push(blockWithBlockId)

                    return
                }

                return

            })

            console.log('resultado del array locksListToFilter')
            // console.log(locksListToFilter)



            // 2)
            // ************* aqui filtramos los mensajes con la lista de blocks final, para extrear los mensajes de ambos usuarios, solo cuando el primer block sea inactivo y el segundo activo, y solo los del usuario actual cuando sea de active a inactive  **************/



            isFoundOneValueUndifined = false

            const messageListFilteredForBlocks = []

            locksListToFilter.forEach((block, index) => {

                const startBlockOfArray = locksListToFilter[index]
                const endBlockOfArray = locksListToFilter[index + 1]


                if (startBlockOfArray.status === 'inactive' && !endBlockOfArray) return

                if (startBlockOfArray.status === 'active' && !endBlockOfArray) return



                // aqui extraemos los mensajes de ambos usuario, ya que si estan en este orden inactive a active indica que ninguno de los participantes se estaba bloqueando en ese momento
                if (startBlockOfArray.status === 'inactive' && endBlockOfArray.status === 'active') {

                    // aqui filtramos solo los mensajes de este usuario y que sean menores a la fecha del startBlockOfArray y mayores o iguales a endBlockOfArray
                    const messageFiltered = messagesList.filter((mess) => mess.timestamp > startBlockOfArray.block_date && mess.timestamp <= endBlockOfArray.block_date)

                    if (messageFiltered.length === 0) return

                    messageListFilteredForBlocks.push(messageFiltered)

                    return

                }


                // aqui extraemos los mensajes solo de este usuario, ya que si estan en este orden active a inactive indica que alguno de los dos participantes se estaba bloqueando en ese momento
                if (startBlockOfArray.status === 'active' && endBlockOfArray.status === 'inactive') {


                    // aqui filtramos solo los mensajes de este usuario y que sean menores a la fecha del startBlockOfArray y mayores o iguales a endBlockOfArray
                    const messageFiltered = messagesList.filter((mess) => (mess.user_id === userId && mess.timestamp > startBlockOfArray.block_date && mess.timestamp <= endBlockOfArray.block_date))


                    if (messageFiltered.length === 0) return

                    messageListFilteredForBlocks.push(messageFiltered)

                    return

                }

            })


            console.log('******************************')
            // console.log(messagesList)
            // console.log(messageListFilteredForBlocks)


            // aqui devolvemos vacio en el caso de que el filtro de mensajes haya filtrado y no quedo ningun mensaje en el array de messageListFilteredForBlocks  
            if (messageListFilteredForBlocks.length === 0) {
                return messageListWithUserData = []
            }


            const messageListObtained = messageListFilteredForBlocks.reduce((acumulador, array) => {
                return acumulador.concat(array)
            })

            // console.log(messageListObtained)


            messageListWithUserData = await Promise.all(
                messageListObtained.map(async (message) => {

                    const sql = 'SELECT * FROM users WHERE user_id = $1'

                    const userDataForSql = [message.user_id]


                    const userData = await connection.query(sql, userDataForSql)

                    const userDataObtained = userData.rows[0]

                    const profilePictureUrl = await GetFileUrl(userDataObtained.profile_picture, 88000)

                    return {
                        ...message,
                        user_data: {
                            user_id: userDataObtained.user_id,
                            username: userDataObtained.username,
                            profile_picture: profilePictureUrl
                        }
                    }

                })
            )

        }


        // console.log(messageListWithUserData)

        const data = {
            messages: messageListWithUserData
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})




// PUT /messages/?messageId={messageId}&newReadStatus={newReadStatus}&newReadTimestamp={newReadTimestamp}
router.put('/messages', authenticate, authorize, async (req, res) => {

    const { messageId, newReadStatus, newReadTimestamp } = req.query

    // console.log(userId, chatId)

    try {
            
        console.log('se ejecuto una actualizacion de mensaje')
        console.log(messageId, newReadStatus, newReadTimestamp)
        if (!messageId || !newReadStatus ||  !newReadTimestamp  ) {
            throw { status: 404, message: `the user has not selected any chat.` }
        }
         
        const sqlForUpdateMessage = "UPDATE messages SET is_read = $1, read_timestamp = $2 WHERE message_id = $3"

        const messageData = [newReadStatus, newReadTimestamp, messageId]


        const result = await connection.query(sqlForUpdateMessage, messageData)


        if (result.rowCount === 0) {
            console.log(`hubo un problema al actualizar el mensaje }`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint PUT /messages/ :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})


// /messages/?messageId={messageId}
router.delete('/messages', authenticate, authorize, async (req, res) => {

    const { userId } = req.user
    const { messageId } = req.query

    // console.log(userId, chatId)

    try {

        const sql = `DELETE FROM messages WHERE message_id = $1`
        const messageData = [messageId]


        const result = await connection.query(sql, messageData)


        if (result.rowCount === 0) {
            console.log(`hubo un problema al eliminar el mensaje en el chat con id ${message.chat_id}`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}

)



export default router