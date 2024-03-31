import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { ComparatePassword } from "../utils/index.js";
import membersService from "../services/membersService.js";


export const getMembers = async (req, res) => {

    const { userId } = req.user
    const { group_id } = req.query


    try {


        // if (!group_id) {
        //     throw { status: 404, message: `the user has not selected any group.` }
        // }

        const sql = 'SELECT * FROM group_members WHERE group_id = $1'
        const groupData = [group_id]
  
        const membersListOfGroup = await membersService.getMembers(sql, groupData)
   
        const data = {
            members_list: membersListOfGroup
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const getValidatedMembers = async (req, res) => {

    const { userId } = req.user
    const { group_id } = req.query


    try {


        // if (!group_id) {
        //     throw { status: 404, message: `the user has not selected any group.` }
        // }

        const sql = 'SELECT * FROM group_members WHERE group_id = $1'
        const groupData = [group_id]


        const membersListOfGroup = await membersService.getValidatedMembers(sql, groupData) 


        const data = {
            members_list: membersListOfGroup
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint GET /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}



export const saveMembers = async (req, res) => {

    const { userId } = req.user
    const { invitation_id, group_password } = req.body

    // console.log(invitation_id)

    // 1)
    const sqlForGetGroupData = 'SELECT * FROM groups WHERE invitation_id = $1'

    // 2)
    const sqlForAddMemberToGroup = 'INSERT INTO group_members(group_id, user_id, role) VALUES($1, $2, $3)'

    // 3)
    const sqlForAddMemberToChat = 'INSERT INTO chat_participants(chat_id, user_id, status, union_date) VALUES($1, $2, $3, $4)'

    // 4)
    const sqlForUpdateChat = 'UPDATE chats SET  last_update = $1 WHERE chat_id = $2'



    try {

        if (!invitation_id) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // 1)*******************************************
        // ************ validar invitacion de id y password de grupo *************    

        const groupDataForSql = [invitation_id]
 
        const groupData = await membersService.saveMembers(sqlForGetGroupData, groupDataForSql, group_password, sqlForAddMemberToGroup, userId, sqlForAddMemberToChat, sqlForUpdateChat) 
       
        const data = {
            group_id: groupData.group_id,
            chat_id: groupData.chat_id
        }

        res.status(201).json({ status: "OK", data });


    } catch (error) {
        console.error('Se produjo un error en el endpint POST /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}


export const updateMembers = async (req, res) => {

    const { userId, groupId, role } = req.query

    // console.log(invitation_id)

    // 1)
    const sqlForUpdateRoleOfMember = 'UPDATE group_members SET role = $1 WHERE user_id = $2 AND group_id = $3'


    try {

        if (!userId || !groupId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // 1)*******************************************
        // *********** Aqui actualizamos el role del miembro de grupo a adm ************


        const dataForUpdateRole = [role, userId, groupId]

        await membersService.updateMembers(sqlForUpdateRoleOfMember, dataForUpdateRole) 
        

        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint POST /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

} 



export const deleteMembers = async (req, res) => {

    const { userId, groupId, chatId } = req.query

    // console.log(invitation_id)

    // 1)
    const sqlForDeleteMember = 'DELETE FROM group_members WHERE user_id = $1 AND group_id = $2'

    // 2)
    const sqlForDeleteParticipant = 'DELETE FROM chat_participants WHERE user_id = $1 AND chat_id = $2'

    try {

        if (!userId || !groupId || !chatId) {
            throw { status: 400, message: `please fill in the missing fields` }
        }


        // 1)*******************************************
        // *********** Aqui eliminamos al miembro del grupo ************
        const dataForDeleteMember = [userId, groupId]


        // 2)*******************************************
        // *********** Aqui eliminamos al miembro del grupo ************
        const dataForDeleteParticipant = [userId, chatId]

        
        await membersService.deleteMembers(sqlForDeleteMember, dataForDeleteMember, sqlForDeleteParticipant, dataForDeleteParticipant) 
       


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint  DELETE /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}