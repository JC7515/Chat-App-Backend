import express from "express";
import connection from "../../connectionDb.cjs";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()


// Aqui obtenemos todos los contactos con el user_id de nuestro usuario desde la tabla constacts en la db 
router.get('/contacts', authenticate, authorize, async (req, res) => {

    const { userId } = req.user

    // console.log(userId)

    try {

        const sql = 'SELECT * FROM contacts WHERE user_id = $1'
        const userData = [userId]


        const resultOfGetUserContacts = await connection.query(sql, userData)


        const contactsList = resultOfGetUserContacts.rows


        // aqui mapeamos los datos para devolver un objeto con la misma estructura de un objeto contacts, pero cambiando la propiedad contact_user_id por user y otorgandole los datos del usuario obtenido a la propiedad user   

        const contactsListOfUser = await Promise.all(
            contactsList.map(async (contact, index) => {

                const sql = 'SELECT * FROM users WHERE user_id = $1'

                const contactDataForSql = [contact.contact_user_id]


                const resultOfGetGroupData = await connection.query(sql, contactDataForSql)

                const contactDataObtained = resultOfGetGroupData.rows[0]

                return {
                    contact_id: contact.contact_id,
                    user_id: contact.user_id,
                    contact_user: contactDataObtained,
                    chat_id: contact.chat_id
                }
            })

        )

        const data = {
            constacts_list: contactsListOfUser
        }

        res.status(201).json({ status: "OK", data: data });


    } catch (error) {
        console.error('Se produjo un error en el endpint /auth/profile :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}
)

router.put('/contacts', (req, res) => {
    // actualizar contacto como a bloqueado o desbloqueado, por el momento no realizaremos esta funcionabilidad
})

router.post('/contacts', authenticate, authorize, async (req, res) => {



    const { userId } = req.user
    const { contact_user_id } = req.body




    const sqlForCreateChat = 'INSERT INTO chats(chat_id, name, type, last_update) VALUES($1, $2, $3, $4)'


    const sqlForRegisterUsersToChat = 'INSERT INTO chat_participants(chat_id, user_id, status, union_date) VALUES($1, $2, $3, $4)'


    const sqlForResgisterNewContact = 'INSERT INTO contacts(contact_id , user_id , contact_user_id, chat_id) VALUES($1, $2, $3)'



    try {

        if (!userId || !contact_user_id) {
            console.log('faltaron datos en el envio de la peticion POST /contacts')
            throw {
                status: 400, message: `An error occurred, try again
            ​` }
        }



        // ************ Creacion de chat *************
        const chat_id = uuidv4()
        const name = `name${userId, contact_user_id}`
        const chat_type = 'individual'
        const creationDate = new Date()


        const chatDataForRegister = [chat_id, name, chat_type, creationDate]

        const resultChatCreation = await connection.query(sqlForCreateChat, chatDataForRegister)


        if (resultChatCreation.rowCount === 0) {
            console.log('la propiedad rowCount indica que el chat no se creo con exito')
            throw { status: 500, message: `An error occurred, try again` }
        }



        // ******** creacion de participantes de chat ***********

        const listaOfUsers = [userId, contact_user_id]

        listaOfUsers.map( async (participant_id) => {

            const adminDataForChatRegister = [chat_id, participant_id, 'activo']

            const resultOfUserRegisterInChat = await connection.query(sqlForRegisterUsersToChat, adminDataForChatRegister)

            if (resultOfUserRegisterInChat.rowCount === 0) {
                console.log('la propiedad rowCount indica que nos se registro los participantes del chat al chat con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }
    
        })



        // ************ Creacion de nuevo contacto *************   
        
    

        const contact_id = uuidv4()

        const DataForRegisterContacts = [[contact_id, userId, contact_user_id, chat_id ], [contact_id, contact_user_id, userId, chat_id]]

        DataForRegisterContacts.map(async (dataForCreateContact) => {
       
            const dataForQuery = [dataForCreateContact]
            const resultOfContactsCreation = await connection.query(sqlForResgisterNewContact, dataForQuery)


            if (resultOfContactsCreation.rowCount === 0) {
                console.log('la propiedad rowCount indica que el nuevo contacto no se creo con exito')
                throw { status: 500, message: `An error occurred, try again` }
            }

        })


        res.status(201).json({ status: "OK" });

    } catch (error) {
        console.error('Se produjo un error en el endpint /SignUp :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }

})

router.delete('/contacts', (req, res) => {
    // eleminar un contacto de tu lista   
})



export default router