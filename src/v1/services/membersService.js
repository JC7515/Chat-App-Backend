import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import { ComparatePassword } from "../utils/index.js";
import members from "../databases/members.js";


const getMembers = async (sql, groupData) => {

    try {
        
        const result = await members.getMembers(sql, groupData)

        return result


    } catch (error) {
        throw error
    }
}



const getValidatedMembers = async (sql, groupData) => {

    try {
        
        const result = await members.getValidatedMembers(sql, groupData)

        return result
        

    } catch (error) {
        throw error
    }
}



const saveMembers = async (sqlForGetGroupData, groupDataForSql, group_password, sqlForAddMemberToGroup, userId, sqlForAddMemberToChat, sqlForUpdateChat) => {

    try {
        

        const result = await members.saveMembers(sqlForGetGroupData, groupDataForSql, group_password, sqlForAddMemberToGroup, userId, sqlForAddMemberToChat, sqlForUpdateChat)

        return result
        

    } catch (error) {
        throw error
    }
}


const updateMembers = async (sqlForUpdateRoleOfMember, dataForUpdateRole) => {

    try {
        
        const result = await members.updateMembers(sqlForUpdateRoleOfMember, dataForUpdateRole)

        return result


    } catch (error) {
        throw error
    }
} 



const deleteMembers = async (sqlForDeleteMember, dataForDeleteMember, sqlForDeleteParticipant, dataForDeleteParticipant) => {

    try {

        const result = await members.deleteMembers(sqlForDeleteMember, dataForDeleteMember, sqlForDeleteParticipant, dataForDeleteParticipant)

        return result

    } catch (error) {
        throw error
    }
}


export default { getMembers, getValidatedMembers, saveMembers, updateMembers, deleteMembers }