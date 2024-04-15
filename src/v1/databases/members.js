import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { ComparatePassword } from "../utils/index.js";



const getMembers = async (sql, groupData) => {

    try {


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

                // console.log(userDataModified)

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

        return membersListOfGroup


    } catch (error) {
        throw { status: 500, message: error?.message || error };

    }
}



const getValidatedMembers = async (sql, groupData) => {

    try {


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

                    // console.log(userDataModified)

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


        return membersListOfGroup


    } catch (error) {
        throw { status: 500, message: error?.message || error };

    }
}



const saveMembers = async (sqlForGetGroupData, groupDataForSql, group_password, sqlForAddMemberToGroup, userId, sqlForAddMemberToChat, sqlForUpdateChat) => {

    try {


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


        return groupData

    } catch (error) {
        throw { status: 500, message: error?.message || error };

    }
}


const updateMembers = async (sqlForUpdateRoleOfMember, dataForUpdateRole) => {

    try {

        const resultOfUpdateMember = await connection.query(sqlForUpdateRoleOfMember, dataForUpdateRole)


        if (resultOfUpdateMember.rowCount === 0) {
            console.log('la propiedad rowCount indica que el role del miembro no se actualizo con exito PUT /members')
            throw { status: 500, message: `An error occurred, try again` }
        }

        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };

    }
}



const deleteMembers = async (sqlForDeleteMember, dataForDeleteMember, sqlForDeleteParticipant, dataForDeleteParticipant) => {

    try {

        // 1)*******************************************
        // *********** Aqui eliminamos al miembro del grupo ************


        const resultOfDeleteMember = await connection.query(sqlForDeleteMember, dataForDeleteMember)


        if (resultOfDeleteMember.rowCount === 0) {
            console.log('la propiedad rowCount indica que el miembro no se elimino con exito DELETE /members')
            throw { status: 500, message: `An error occurred, try again` }
        }

        // 2)*******************************************
        // *********** Aqui eliminamos al miembro del grupo ************

        const resultOfDeleteParticipant = await connection.query(sqlForDeleteParticipant, dataForDeleteParticipant)


        if (resultOfDeleteParticipant.rowCount === 0) {
            console.log('la propiedad rowCount indica que el miembro no se elimino con exito DELETE /members')
            throw { status: 500, message: `An error occurred, try again` }
        }
   
        return


    } catch (error) {
        throw { status: 500, message: error?.message || error };

    }
}



export default { getMembers, getValidatedMembers, saveMembers, updateMembers, deleteMembers }