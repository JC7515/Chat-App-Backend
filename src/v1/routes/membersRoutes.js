import express from "express";
import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { ComparatePassword } from "../utils/index.js";

const router = express.Router()

// /members/?group_id={group_id}
router.get('/members', authenticate, authorize, async (req, res) => {

    const { userId } = req.user
    const { group_id } = req.query


    try {


        // if (!group_id) {
        //     throw { status: 404, message: `the user has not selected any group.` }
        // }

        const sql = 'SELECT * FROM group_members WHERE group_id = $1'
        const groupData = [group_id]


        const resultOfGetMembers = await connection.query(sql, groupData)



        if (resultOfGetMembers.rows.length === 0) {
            console.log('la propiedad rows indica que no se encontro ningun miembro con esa id de grupo  en GET /members')
            throw { status: 404, message: `Member not Found, try again` }
        }


        const membersList = resultOfGetMembers.rows


        // aqui mapeamos los datos para devolver un array de objetos con la misma estructura de un objeto group_members, pero cambiando la propiedad user_id por user y otorgandole los datos del usuario obtenido a la propiedad user   

        const membersListOfGroup = await Promise.all(
            membersList.map(async (member, index) => {

                const sql = 'SELECT socket_id,user_id, username, name, profile_picture FROM users WHERE user_id = $1'

                const userDataForSql = [member.user_id]


                const resultOfGetUserData = await connection.query(sql, userDataForSql)

                const userDataObtained = resultOfGetUserData.rows[0]

                // aqui obtenemos la url de la imagen de perfil del miembro
                const profilePictureUrl = await GetFileUrl(userDataObtained.profile_picture, 88000)

                // aqui asignamos la url de la imagen de perfil a la propiedad profile_picture
                const userDataModified = {
                    ...userDataObtained,
                    profile_picture: profilePictureUrl
                }

                console.log(userDataModified)

                if (member.role === 'admin') {

                    const sqlforGetInvitationId = 'SELECT invitation_id FROM groups WHERE group_id = $1'

                    const groupDataForSql = [member.group_id]

                    const resultOfGetInvitationId = await connection.query(sqlforGetInvitationId, groupDataForSql)

                    const invitationIdValue = resultOfGetInvitationId.rows[0].invitation_id

                    return {
                        group_id: member.group_id,
                        user: userDataModified,
                        invitation_id: invitationIdValue,
                        role: member.role,
                    }
                }

                return {
                    group_id: member.group_id,
                    user: userDataModified,
                    role: member.role,
                }

            })

        )


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
)




// /members/?group_id={group_id}
router.get('/validateMembers', authenticate, authorize, async (req, res) => {

    const { userId } = req.user
    const { group_id } = req.query


    try {


        // if (!group_id) {
        //     throw { status: 404, message: `the user has not selected any group.` }
        // }

        const sql = 'SELECT * FROM group_members WHERE group_id = $1'
        const groupData = [group_id]


        const resultOfGetMembers = await connection.query(sql, groupData)


        if (resultOfGetMembers.rows.length === 0) {
            console.log('la propiedad rows indica que no se encontro ningun miembro con esa id de grupo  en GET /members')
            // throw { status: 404, message: `Member not Found, try again` }
        }


        const membersList = resultOfGetMembers.rows

        let membersListOfGroup = []

        if (membersList.length > 0) {

            // aqui mapeamos los datos para devolver un array de objetos con la misma estructura de un objeto group_members, pero cambiando la propiedad user_id por user y otorgandole los datos del usuario obtenido a la propiedad user   

            membersListOfGroup = await Promise.all(
                membersList.map(async (member, index) => {

                    const sql = 'SELECT socket_id,user_id, username, name, profile_picture FROM users WHERE user_id = $1'

                    const userDataForSql = [member.user_id]


                    const resultOfGetUserData = await connection.query(sql, userDataForSql)

                    const userDataObtained = resultOfGetUserData.rows[0]

                    // aqui obtenemos la url de la imagen de perfil del miembro
                    const profilePictureUrl = await GetFileUrl(userDataObtained.profile_picture, 88000)

                    // aqui asignamos la url de la imagen de perfil a la propiedad profile_picture
                    const userDataModified = {
                        ...userDataObtained,
                        profile_picture: profilePictureUrl
                    }

                    console.log(userDataModified)

                    if (member.role === 'admin') {

                        const sqlforGetInvitationId = 'SELECT invitation_id FROM groups WHERE group_id = $1'

                        const groupDataForSql = [member.group_id]

                        const resultOfGetInvitationId = await connection.query(sqlforGetInvitationId, groupDataForSql)

                        const invitationIdValue = resultOfGetInvitationId.rows[0].invitation_id

                        return {
                            group_id: member.group_id,
                            user: userDataModified,
                            invitation_id: invitationIdValue,
                            role: member.role,
                        }
                    }

                    return {
                        group_id: member.group_id,
                        user: userDataModified,
                        role: member.role,
                    }

                })

            )

        }


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
)

// /members
router.post('/members', authenticate, authorize, async (req, res) => {

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


        const resultGetgroupData = await connection.query(sqlForGetGroupData, groupDataForSql)

        const groupData = resultGetgroupData.rows[0]

        if (resultGetgroupData.rows.length === 0) {
            console.log('la propiedad rows indica que no se encontro ningun grupo con esa id de invitacion en POST /members')
            throw { status: 404, message: `the invitation id is not valid or group not exits, try again` }
        }


        if (groupData.group_password && !group_password) {
            console.log('no se proporcionado la contraseña de grupo por el usuario en POST /members')
            throw { status: 401, message: `Its necesary a Password To enter, try again` }
        }


        if (groupData.group_password & group_password) {

            const isCorrectPassword = await ComparatePassword(group_password, groupData.group_password)


            if (!isCorrectPassword) {
                console.log('la contraseña de grupo proporcionado por el usuario es incorrecta en POST /members')
                throw { status: 401, message: `Incorrect password, try again` }
            }

        }



        // 2)*******************************************
        // ********* adjuntar miembro grupo ***********

        const roleOFMember = 'member'

        const MemberDataForAddToGroup = [groupData.group_id, userId, roleOFMember]

        const resultMemberRegister = await connection.query(sqlForAddMemberToGroup, MemberDataForAddToGroup)


        if (resultMemberRegister.rowCount === 0) {
            console.log('la propiedad rowCount indica que no se registro al usuario como miembro con exito en la POST /members')
            throw { status: 500, message: `An error occurred, try again` }
        }



        // 3)*******************************************
        // ********* adjuntar miembro al chat del grupo ***********

        const memberStatus = 'inactive'
        const unionDate = new Date()

        const MemberDataForAddToGroupChat = [groupData.chat_id, userId, memberStatus, unionDate]

        const resultAddMemberToGroupChat = await connection.query(sqlForAddMemberToChat, MemberDataForAddToGroupChat)


        if (resultAddMemberToGroupChat.rowCount === 0) {
            console.log('la propiedad rowCount indica que no se registro al usuario como miembro del chat de grupo con exito en la POST /members')
            throw { status: 500, message: `An error occurred, try again` }
        }



        // 4)*******************************************
        // *********** Actualizacion de ultima actualizacion de chat ************

        const DateOfNewLastUpdate = new Date()

        const chatDataForUpdateRegister = [DateOfNewLastUpdate, groupData.chat_id]

        const resultOfChatDataUpdated = await connection.query(sqlForUpdateChat, chatDataForUpdateRegister)


        if (resultOfChatDataUpdated.rowCount === 0) {
            console.log('la propiedad rowCount indica que el chat no se actualizo con exito POST /members')
            throw { status: 500, message: `An error occurred, try again` }
        }

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
)



// esta logica sirve para cambiar el role de un miembro de grupo 
// /members/?userId=${userId}&groupId=${groupId}&role=${role}
router.put('/members', authenticate, authorize, async (req, res) => {

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

        const resultOfUpdateMember = await connection.query(sqlForUpdateRoleOfMember, dataForUpdateRole)


        if (resultOfUpdateMember.rowCount === 0) {
            console.log('la propiedad rowCount indica que el role del miembro no se actualizo con exito PUT /members')
            throw { status: 500, message: `An error occurred, try again` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint POST /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

}
)


// /members/?userId=${userId}&groupId=${groupId}&chatId=${chatId}
router.delete('/members', authenticate, authorize, async (req, res) => {

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

        const resultOfDeleteMember = await connection.query(sqlForDeleteMember, dataForDeleteMember)


        if (resultOfDeleteMember.rowCount === 0) {
            console.log('la propiedad rowCount indica que el miembro no se elimino con exito DELETE /members')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 2)*******************************************
        // *********** Aqui eliminamos al miembro del grupo ************


        const dataForDeleteParticipant = [userId, chatId]

        const resultOfDeleteParticipant = await connection.query(sqlForDeleteParticipant, dataForDeleteParticipant)


        if (resultOfDeleteParticipant.rowCount === 0) {
            console.log('la propiedad rowCount indica que el miembro no se elimino con exito DELETE /members')
            throw { status: 500, message: `An error occurred, try again` }
        }


        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint  DELETE /members :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

})



export default router