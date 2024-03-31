import connection from "../../connectionDb.cjs";
import { GetCurrentDateString, GetTwoGroupInicials } from "../helpers/index.js";
import { HashPassword } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid'
import groups from "../databases/groups.js";


const getGroups = async (userData, sql) => {

    try {

        const result = await groups.getGroups(userData, sql)

        return result

    } catch (error) {
        throw error
    }
}



const saveGroups = async (chatDataForRegister, sqlForCreateChat, groupDataForRegister, sqlForCreateGroup, sqlForCreateChatParticipants, DataForChatParticipants, sqlForDeclareGroupAdmin, adminDataForChatRegister) => {

    try {
      
        const result = await groups.saveGroups(chatDataForRegister, sqlForCreateChat, groupDataForRegister, sqlForCreateGroup, sqlForCreateChatParticipants, DataForChatParticipants, sqlForDeclareGroupAdmin, adminDataForChatRegister)

        return result


    } catch (error) {
        throw error
    }
}



const deleteGroups = async (dataForDeleteGroup, sqlForDeleteGroup, dataForDeleteMessages, sqlForDeleteGroupMessages) => {

    try {

      
        const result = await groups.deleteGroups(dataForDeleteGroup, sqlForDeleteGroup, dataForDeleteMessages, sqlForDeleteGroupMessages)

        return result
  

    } catch (error) {
        throw error
    }
}


export default { getGroups, saveGroups, deleteGroups }