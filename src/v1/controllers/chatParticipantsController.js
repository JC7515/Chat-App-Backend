import connection from "../../connectionDb.cjs";


export const getContactChatParticipants = async (req, res) => {

    const { userId } = req.user
    const { chat_id } = req.query

    
    // 1)
    const sqlForGetChatData = 'SELECT * FROM chats WHERE chat_id = $1'
    
    
    
    // 2)
    const sqlForGetChatParticipants = 'SELECT * FROM chat_participants WHERE chat_id = $1'
    
    
    try {

        
        // 1)
        /* ******** aqui obtenemos la data del chat **** */
        const chatData = [chat_id]


        const resultOfGetChat = await connection.query(sqlForGetChatData, chatData)


        const chatDataObtained = resultOfGetChat.rows


        // 2)
        /* ******** aqui obtenemos los ids de los participantes del chat ****** */


        const resultOfGetChatParticipants = await connection.query(sqlForGetChatParticipants, chatData)


        // aqui obtengo la lista de los ids de los participantes del chat
        const chatParticipantsDataObtained = resultOfGetChatParticipants.rows


        // 3)
        /* ******** aqui obtenemos la data de los participantes del chat y la mapeamos para el cliente ****** */


        const chatParticipantsDataList = await Promise.all(
            chatParticipantsDataObtained.map(async (participant) => {

                const sql = 'SELECT * FROM users WHERE user_id = $1'

                const participantDataForSql = [participant.user_id]


                const participantsData = await connection.query(sql, participantDataForSql)


                const participantDataObtained = participantsData.rows[0]

                return {
                    user_id: participantDataObtained.user_id,
                    status: participant.status,
                    username: participantDataObtained.username,
                    union_date: participant.union_date
                }

            })
        )


        console.log(chatParticipantsDataList)

        const data = {
            chat_data: chatDataObtained,
            chat_participants: chatParticipantsDataList
        }


        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const getGroupChatParticipants = async (req, res) => {

    const { userId } = req.user
    const { chat_id } = req.query

    // 1)
    const sqlForGetChatData = 'SELECT * FROM chats WHERE chat_id = $1'

    // 2)
    const sqlForGetChatParticipants = 'SELECT * FROM chat_participants WHERE chat_id = $1'


    try {

        const chatData = [chat_id]

        // 1)
        /* ******** aqui obtenemos la data del chat **** */


        const resultOfGetChat = await connection.query(sqlForGetChatData, chatData)


        const chatDataObtained = resultOfGetChat.rows[0]

        // 2)
        /* ******** aqui obtenemos los ids de los participantes del chat ****** */


        const resultOfGetChatParticipants = await connection.query(sqlForGetChatParticipants, chatData)


        // aqui obtengo la lista de los ids de los participantes del chat
        const chatParticipantsDataObtained = resultOfGetChatParticipants.rows


        // 3)
        /* ******** aqui obtenemos la data de los participantes del chat y la mapeamos para el cliente ****** */


        const chatParticipantsDataList = await Promise.all(
            chatParticipantsDataObtained.map(async (participant) => {

                const sql = 'SELECT * FROM users WHERE user_id = $1'

                const participantDataForSql = [participant.user_id]


                const participantsData = await connection.query(sql, participantDataForSql)


                const participantDataObtained = participantsData.rows[0]

                return {
                    user_id: participantDataObtained.user_id,
                    status: participant.status,
                    username: participantDataObtained.username,
                    union_date: participant.union_date
                }

            })
        )


        console.log(chatParticipantsDataList)

        const data = {
            chat_data: chatDataObtained,
            chat_participants: chatParticipantsDataList
        }

        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint //GET groups/chats :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}




export const updateChatParticipant = async (req, res) => {

    const { chatId, participantId, newStatus } = req.query

    // 1)
    const sqlForGetParticipantStatus = 'SELECT * FROM chat_participants WHERE status = $1 AND user_id = $2 '

    // 2)
    const sqlForDesactiveAllParticipantStatus = "UPDATE chat_participants SET status = $1 WHERE user_id = $2 AND chat_id = $3"

    // 3)
    const sqlForUpdateStatus = "UPDATE chat_participants SET status = $1 WHERE user_id = $2 AND chat_id = $3"

    try {


        if (!chatId || !participantId || !newStatus) {
            console.log('faltaron datos en el envio de la peticion PUT /groups/chatParticipant')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }


        // 1)
        /* ******** aqui obtenemos todos los chats en donde el participante aparece con estatus de activo **** */

        const statusToFind = 'active'

        const getDataOFParticipant = [statusToFind, participantId]

        const resultOfGetStatus = await connection.query(sqlForGetParticipantStatus, getDataOFParticipant)

        const listOfStatusObtained = resultOfGetStatus.rows


        // 2) 
        // ****** aqui desactivamos el status del usuario del cualquier chat en el que estuviera activo *********** /
        console.log(`array de todos los status activos${resultOfGetStatus.rows}`)
        console.log(resultOfGetStatus.rows)

        if (listOfStatusObtained !== undefined && listOfStatusObtained.length > 0) {


            const inactiveStatusValue = 'inactive'

            const participantDataForSql = [inactiveStatusValue, listOfStatusObtained[0].user_id, listOfStatusObtained[0].chat_id]


            const resultOfDesactiveAllTheStatus = await connection.query(sqlForDesactiveAllParticipantStatus, participantDataForSql)


            if (resultOfDesactiveAllTheStatus.rowCount === 0) {
                console.log('la propiedad rowCount indica que el status del participante del chat no se actualizo con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }

        }


        // 2)
        /* ******** aqui actualizamos el status del participante del chat **** */

        const updateStatusData = [newStatus, participantId, chatId]

        const resultOfUpdateStates = await connection.query(sqlForUpdateStatus, updateStatusData)


        if (resultOfUpdateStates.rowCount === 0) {
            console.log('la propiedad rowCount indica que el status del participante del chat no se actualizo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }


        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint PUT /groups/chatParticipant :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}