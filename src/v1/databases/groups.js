import connection from "../../connectionDb.cjs";
import { GetCurrentDateString, GetTwoGroupInicials } from "../helpers/index.js";
import { HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'


const getGroups = async (userData, sql) => {

    try {

        // 1)
        const resultOfGetUserGroups = await connection.query(sql, userData)


        const groupsList = resultOfGetUserGroups.rows


        // aqui mapeamos los datos para devolver un array de objetos con la misma estructura de un objeto group_members, pero cambiando la propiedad user_id por user y otorgandole los datos del usuario obtenido a la propiedad user   


        const groupsListOfUser = await Promise.all(
            groupsList.map(async (group, index) => {

                const sql = 'SELECT * FROM groups WHERE group_id = $1'

                const groupDataForSql = [group.group_id]


                const resultOfGetGroupData = await connection.query(sql, groupDataForSql)

                const groupDataObtained = resultOfGetGroupData.rows[0]

                return {
                    group: groupDataObtained,
                    user_id: group.user_id,
                    role: group.role,
                }

            })

        )

        return groupsListOfUser

    } catch (error) {
        throw error
    }
}



const saveGroups = async (chatDataForRegister, sqlForCreateChat, groupDataForRegister, sqlForCreateGroup, sqlForCreateChatParticipants, DataForChatParticipants, sqlForDeclareGroupAdmin, adminDataForChatRegister) => {

    try {


          // 1)
        // ************ Creacion de chat *************


        const resultChatCreation = await connection.query(sqlForCreateChat, chatDataForRegister)


        if (resultChatCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que el chat no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }


        // 2)
        // ************ Creacion de grupo *************   


        const resultgroupCreation = await connection.query(sqlForCreateGroup, groupDataForRegister)


        if (resultgroupCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que el grupo no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 3)
        // ******* Declarar Participantes del chat **********

        const resultDeclaredChatParticipants = await connection.query(sqlForCreateChatParticipants, DataForChatParticipants)


        if (resultDeclaredChatParticipants.rowCount === 0) {
            console.log('la propiedad rowCount indica que no se declaro al usuario como administrador con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 4)
        // ******** Declarar admin del grupo ***********


        const resultDeclaredAdmin = await connection.query(sqlForDeclareGroupAdmin, adminDataForChatRegister)


        if (resultDeclaredAdmin.rowCount === 0) {
            console.log('la propiedad rowCount indica que no se declaro al usuario como administrador con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }


        return 


    } catch (error) {
        throw error
    }
}



const deleteGroups = async (dataForDeleteGroup, sqlForDeleteGroup, dataForDeleteMessages, sqlForDeleteGroupMessages) => {

    try {

          
        // 1)*******************************************
        // *********** Aqui eliminamos el grupo del cual ya no ahi participantes dentro ************


        const resultOfDeleteGroup = await connection.query(sqlForDeleteGroup, dataForDeleteGroup)


        if (resultOfDeleteGroup.rowCount === 0) {
            console.log('la propiedad rowCount indica que el grupo no se elimino con exito DELETE /groups')
            throw { status: 500, message: `An error occurred, try again` }
        }


        // 2)*******************************************
        // *********** Aqui eliminamos todos los mensajes del grupo ************


        await connection.query(sqlForDeleteGroupMessages, dataForDeleteMessages)


        return


    } catch (error) {
        throw error
    }
}

export default { getGroups, saveGroups, deleteGroups }