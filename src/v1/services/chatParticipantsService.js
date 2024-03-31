import connection from "../../connectionDb.cjs";
import chatParticipants from "../databases/chatParticipants.js";

const getContactChatParticipants = async (chatData, sqlForGetChatData, sqlForGetChatParticipants) => {

    try {
        
        const result = await chatParticipants.getContactChatParticipants(chatData, sqlForGetChatData, sqlForGetChatParticipants)

        return result


    } catch (error) {
        throw error
    }
}



const getGroupChatParticipants = async (chatData, sqlForGetChatData, sqlForGetChatParticipants) => {

    try {
        
      
        const result = await chatParticipants.getGroupChatParticipants(chatData, sqlForGetChatData, sqlForGetChatParticipants)

        return result


    } catch (error) {
        throw error
    }

}




const updateChatParticipant = async (getDataOFParticipant, updateStatusData,sqlForGetParticipantStatus, sqlForDesactiveAllParticipantStatus, sqlForUpdateStatus) => {
    
    try {


        
        const result = await chatParticipants.updateChatParticipants(getDataOFParticipant, updateStatusData,sqlForGetParticipantStatus, sqlForDesactiveAllParticipantStatus, sqlForUpdateStatus)

        return result


    } catch (error) {
        throw error
    }
}



export default { getContactChatParticipants, getGroupChatParticipants, updateChatParticipant }
