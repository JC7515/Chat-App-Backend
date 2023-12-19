import express from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";


const router = express.Router()



// /messages/?chatId={chatId}&messagesLimit={messagesLimit}&creationDate={creationDate}
router.get('/messages', authenticate, authorize, async (req, res) => {


    const { userId } = req.user
    const { chatId, messagesLimit, creationDate } = req.query

    // console.log(userId, chatId)

    try {


        console.log(chatId, messagesLimit, creationDate)        
        if( !chatId, !messagesLimit, !creationDate ){
            throw { status: 404, message: `the user has not selected any chat.` }
        }

        // const sql = 'SELECT * FROM messages WHERE chat_id = $1'
        const sql = 'SELECT * FROM messages WHERE chat_id = $1 AND timestamp < $2 ORDER BY timestamp DESC OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY' 

        // const chatData = [chatId]
        const chatData = [chatId, creationDate, 0, messagesLimit]


        const resultOfGetMessages = await connection.query(sql, chatData)


        const messagesList = resultOfGetMessages.rows.reverse()

        // console.log(messagesList)

        let messageListWithUserData  

        if(messagesList.length > 0){
            messageListWithUserData = await Promise.all(
                messagesList.map(async (message) => {
    
                    const sql = 'SELECT * FROM users WHERE user_id = $1'
    
                    const userDataForSql = [message.user_id]
    
    
                    const userData =  await connection.query(sql, userDataForSql)
    
    
                    const userDataObtained = userData.rows[0]
    
                    return {
                        ...message,
                        user_data: {
                            user_id: userDataObtained.user_id,
                            username: userDataObtained.username,
                        } 
                    }
    
                })
            )

        }else{
            messageListWithUserData = []
        }




        // console.log(messageListWithUserData)
        
        const data = {
            messages: messageListWithUserData
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
})

// router.post('/messages', (req, res) => {

// })



// /messages/?messageId={messageId}
router.delete('/messages', authenticate, authorize, async (req, res) => {

    const { userId } = req.user
    const { messageId } = req.query

    // console.log(userId, chatId)

    try {

        const sql = `DELETE FROM messages WHERE message_id = $1`
        const messageData = [messageId]


        const result = await connection.query(sql, messageData)


        if(result.rowCount === 0){
            console.log(`hubo un problema al eliminar el mensaje en el chat con id ${message.chat_id}`)
            throw { status: 404, message: `There was a problem to Delete the message.` }
        }
        
        
        res.status(201).json({ status: "OK" });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}

)



export default router