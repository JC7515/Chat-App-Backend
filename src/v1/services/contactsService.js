import connection from "../../connectionDb.cjs";
import { v4 as uuidv4 } from 'uuid'
import { GetCurrentDateString, GetTwoGroupInicials, TransformDateToCorrectFormatString } from "../helpers/index.js";
import { GetFileUrl } from "../../s3.js";
import contacts from "../databases/contacts.js";

const getContacts = async (sql, ContactData, userId) => {

    try {
        
       const result = await contacts.getContacts(sql, ContactData, userId)       
       
       return result


    } catch (error) {
        throw error
    }
}




const getContactList = async (sql, userData, userId) => {

    try {

        const result = await contacts.getContactList(sql, userData, userId)       
       
        return result        


    } catch (error) {
        throw error
    }
}



const saveContact = async (sqlForGetExistingContact, dataForSearchContact, sqlForRegisterUsersToChat, sqlForResgisterNewContact, sqlForCreateChat, sqlForResgisterNewBlockInactive,userId, contact_user_id) => {


    try {
        

        const result = await contacts.saveContact(sqlForGetExistingContact, dataForSearchContact, sqlForRegisterUsersToChat, sqlForResgisterNewContact, sqlForCreateChat, sqlForResgisterNewBlockInactive, userId, contact_user_id)       
       
        return result
       

    } catch (error) {
        throw error
    }
}



const deleteContact =  async (sqlForValidateAllContacts, dataToObtainAllContactInformation, sqlForDeleteContacts, sqlForDeleteChatParticipants, sqlForDeleteAllBlocksOfChat, sqlForDeleteAllChatHistoryDeletions, sqlForDeleteAllChatNotifications, sqlForDeleteAllChatsMessages, sqlForDeleteContactChat, sqlForUpdateContactInformation, sqlForResgisterChatDeletionMessages, userId, contactUserId, chatId) => {

    try {
        

        const result = await contacts.deleteContact(sqlForValidateAllContacts, dataToObtainAllContactInformation, sqlForDeleteContacts, sqlForDeleteChatParticipants, sqlForDeleteAllBlocksOfChat, sqlForDeleteAllChatHistoryDeletions, sqlForDeleteAllChatNotifications, sqlForDeleteAllChatsMessages, sqlForDeleteContactChat, sqlForUpdateContactInformation, sqlForResgisterChatDeletionMessages, userId, contactUserId, chatId)       
       
        return result
    

    } catch (error) {
        throw error
    }
}


export default { getContacts, getContactList, saveContact, deleteContact }