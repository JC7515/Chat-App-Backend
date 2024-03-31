import connection from "../../connectionDb.cjs";
import { GetCurrentDateString, GetTwoGroupInicials } from "../helpers/index.js";
import { HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import groupsService from '../services/groupsService.js'



export const getGroups = async (req, res) => {

    const { userId } = req.user

    // 1) 
    const sql = 'SELECT * FROM group_members WHERE user_id = $1'

    try {


        // 1) 
        const userData = [userId]

        const groupsListOfUser = await groupsService.getGroups(userData, sql)

        const data = {
            groups_list: groupsListOfUser
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const saveGroups = async (req, res) => {

    const { name, description, admin_id, group_password } = req.body


    // 1)
    const sqlForCreateChat = 'INSERT INTO chats(chat_id, name, type, last_update) VALUES($1, $2, $3, $4)'

    // 2)
    const sqlForCreateGroup = 'INSERT INTO groups(group_id, chat_id, group_name, description, group_picture, group_icon, invitation_id, group_password ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'

    // 3)
    const sqlForCreateChatParticipants = 'INSERT INTO chat_participants(chat_id, user_id, status, union_date) VALUES($1, $2, $3, $4)'

    // 4)
    const sqlForDeclareGroupAdmin = 'INSERT INTO group_members(group_id, user_id, role) VALUES($1, $2, $3)'


    try {

        if (!name || !description) {
            throw { status: 400, message: `Please complete all required fields.` }
        }



        const chat_id = uuidv4()
        const chat_type = 'group'
        const creationDate = new Date()

        const group_id = uuidv4()
        const groupInicials = GetTwoGroupInicials(name)


        // 1)
        // ************ Creacion de chat *************


        const chatDataForRegister = [chat_id, name, chat_type, creationDate]


        // 2)
        // ************ Creacion de grupo *************   

        const invitationId = uuidv4()
        let groupPasswordEncrypted

        if (group_password) {
            groupPasswordEncrypted = HashPassword(group_password)
        }

        const groupDataForRegister = [group_id, chat_id, name, description, '', groupInicials, invitationId, groupPasswordEncrypted]


        // 3)
        // ******* Declarar Participantes del chat **********

        const status = 'inactive'
        const union_date = GetCurrentDateString()

        const DataForChatParticipants = [chat_id, admin_id, status, union_date]


        // 4)
        // ******** Declarar admin del grupo ***********

        const roleOFAdmin = 'admin'

        const adminDataForChatRegister = [group_id, admin_id, roleOFAdmin]

    
        await groupsService.saveGroups(chatDataForRegister, sqlForCreateChat, groupDataForRegister, sqlForCreateGroup, sqlForCreateChatParticipants, DataForChatParticipants, sqlForDeclareGroupAdmin, adminDataForChatRegister)

         

        const data = {
            invitation_id: invitationId
        }

        res.status(201).json({ status: "OK", data: data });

    } catch (error) {
        console.error('Se produjo un error en el endpint POST /groups:', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}



export const deleteGroups = async (req, res) => {

    const { chatId, groupId } = req.query

    // console.log(invitation_id)

    // 1)
    const sqlForDeleteGroup = 'DELETE FROM groups WHERE group_id = $1'

    // 2)
    const sqlForDeleteGroupMessages = 'DELETE FROM messages WHERE chat_id = $1'


    try {

        if (!chatId || !groupId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // 1)*******************************************
        // *********** Aqui eliminamos el grupo del cual ya no ahi participantes dentro ************


        const dataForDeleteGroup = [groupId]

        const resultOfDeleteGroup = await connection.query(sqlForDeleteGroup, dataForDeleteGroup)


        if (resultOfDeleteGroup.rowCount === 0) {
            console.log('la propiedad rowCount indica que el grupo no se elimino con exito DELETE /groups')
            throw { status: 500, message: `An error occurred, try again` }
        }



        // 2)*******************************************
        // *********** Aqui eliminamos todos los mensajes del grupo ************

        const dataForDeleteMessages = [chatId]

        const resultOfDeleteMessages = await connection.query(sqlForDeleteGroupMessages, dataForDeleteMessages)


        // if (resultOfDeleteMessages.rowCount === 0) {
        //     console.log('la propiedad rowCount indica que los mensajes del grupo no se elimino con exito DELETE /grupo')
        //     throw { status: 500, message: `An error occurred, try again` }
        // }



        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint POST /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}