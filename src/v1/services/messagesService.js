import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { GetCurrentDateString } from "../helpers/index.js";
import messages from "../databases/messages.js";


const getGroupMessages = async (sql, chatData) => {

    try {

        const result = await messages.getGroupMessages(sql, chatData)

        return result

    } catch (error) {
        throw error
    }
}



const getContactMessages = async (sqlForGetChatParticipants, DataForGetChatParticipants, chatId, messagesLimit, creationDate, userId) => {


    try {


        const { messagesList, blocksArray, blocksOfThisUser
            , blocksOfTheOtherParticipant } = await messages.getContactMessages(sqlForGetChatParticipants, DataForGetChatParticipants, chatId, messagesLimit, creationDate, userId)

        console.log('messagesList')
        console.log(messagesList)
        console.log(messagesList.length)

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


                // aqui obtenemos el bloqueo inactive con la fecha mas alta de los dos blocks de cada partticipante de chat de contacto
                if (!isFoundOneValueUndifined && blockOfLongestArray.status === 'inactive' && blockOfShortestArray.status === 'inactive') {

                    // ******* Si algunos de los blocks no cuenta block_id esta logica de la condicion no se ejecuta y se procede a buscar el unico block inactive que tenga id, para almecenarlos en el array final de filtrado****

                    // aqui validamos que los dos blocks cuente con su propiedad block_id, para poder diferenciar de los block creados por el usuario y los blocks block_id creados por el backend para rellenar, asi evitamos que se compare una fecha antigua y una fecha actual recien creada y que se extraiga esta fecha invalida, en vez de la valida, asi provocando de que no se filtre bien los mensajes bloqueados del contacto
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


                // aqui obtenemos el bloqueo active con la fecha mas baja de los dos blocks de cada partticipante de chat de contacto
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

                    // aqui filtramos solo los mensajes de este usuario y que sean mayores a la fecha del startBlockOfArray y menores o iguales a endBlockOfArray
                    const messageFiltered = messagesList.filter((mess) => mess.timestamp > startBlockOfArray.block_date && mess.timestamp <= endBlockOfArray.block_date)

                    if (messageFiltered.length === 0) return

                    messageListFilteredForBlocks.push(messageFiltered)

                    return

                }


                // aqui extraemos los mensajes solo de este usuario, ya que si estan en este orden active a inactive indica que alguno de los dos participantes se estaba bloqueando en ese momento
                if (startBlockOfArray.status === 'active' && endBlockOfArray.status === 'inactive') {


                    // aqui filtramos solo los mensajes de este usuario y que sean mayores a la fecha del startBlockOfArray y menores o iguales a endBlockOfArray
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

            console.log('messageListObtained')
            console.log(messageListObtained)


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

            // return
        }


        return messageListWithUserData


    } catch (error) {
        throw error
    }
}



const updateMessages = async (sqlForUpdateMessage, messageData) => {

    try {

        const result = await messages.updateMessages(sqlForUpdateMessage, messageData)

        return result

    } catch (error) {
        throw error
    }
}




const deleteMessages = async (sql, messageData) => {

    try {

        const result = await messages.deleteMessages(sql, messageData)

        return result

    } catch (error) {
        throw error
    }
}




export default { getGroupMessages, getContactMessages, updateMessages, deleteMessages }


