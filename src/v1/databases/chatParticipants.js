import connection from "../../connectionDb.cjs";


const getContactChatParticipants = async (chatData, sqlForGetChatData, sqlForGetChatParticipants) => {

    try {

        // 1)
        /* ******** aqui obtenemos la data del chat **** */

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

        return {
            chatDataObtained: chatDataObtained, chatParticipantsDataList: chatParticipantsDataList
        }


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



const getGroupChatParticipants = async (chatData, sqlForGetChatData, sqlForGetChatParticipants) => {

    try {

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


        return {
            chatDataObtained: chatDataObtained, chatParticipantsDataList: chatParticipantsDataList
        }


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }

}




const updateChatParticipants = async (getDataOFParticipant, updateStatusData, sqlForGetParticipantStatus, sqlForDesactiveAllParticipantStatus, sqlForUpdateStatus) => {


    try {

                // 1)
        /* ******** aqui obtenemos todos los chats en donde el participante aparece con estatus de activo **** */


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

        const resultOfUpdateStates = await connection.query(sqlForUpdateStatus, updateStatusData)


        if (resultOfUpdateStates.rowCount === 0) {
            console.log('la propiedad rowCount indica que el status del participante del chat no se actualizo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }


        return 

    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}



export default { getContactChatParticipants, getGroupChatParticipants, updateChatParticipants }