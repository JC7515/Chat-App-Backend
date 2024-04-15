import request from "supertest";
import { SERVER_PORT } from "../../configEnv.js";
import connection from "../../connectionDb.cjs";
import { server } from "../../socketIo.js";
import { GetCurrentDateString } from "../helpers/index.js";
import { authToken, userData } from "./contactsRoutes.spec.js";


// let userData;
// let authToken;

// beforeAll(async () => {

//     // server.listen( SERVER_PORT, () => {
//     //     console.log(`el servidor esta corriendo el puesto ${SERVER_PORT}`)
//     // })

//     const dataForLogin = {
//         email: 'test.1234@gmail.com',
//         password: 'Test123456'
//     }
//     const respons = await request(server).post("/v1/auth/login").send(dataForLogin)

//     authToken = respons.body.data.access_token

//     expect(respons.statusCode).toBe(201)
//     expect(typeof respons.body.data.access_token).toBe('string')

//     const authorization = {
//         headers: {
//             'authorization': `Bearer ${authToken}`,
//         }
//     }

//     const response = await request(server).get('/v1/auth/profile').set(authorization.headers)

//     userData = response.body.data

//     console.log(response.body.data)
//     console.log(userData)

//     expect(response.statusCode).toBe(201)


// })



describe('GET /v1/group/messages', () => {


    it('Should get the group list of user', async () => {

        const chatId = "bfe35a72-85d4-4ff6-9f73-fd6e1c5d20b9"
        const messagesLimit = 20
        const creationDate = GetCurrentDateString()

        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/group/messages/?chatId=${chatId}&messagesLimit=${messagesLimit}&creationDate=${creationDate}`).set(authorization.headers)

        expect(response.statusCode).toBe(201)
        expect(response.body.data.messages).toBeInstanceOf(Array)

    })


})


describe('GET /v1/contact/messages', () => {


    it('Should get the contact list of user ', async () => {

        const chatId = "bfbf76fa-5586-4f48-9e49-30481ba01320"
        const messagesLimit = 20
        const creationDate = GetCurrentDateString()

        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/contact/messages/?chatId=${chatId}&messagesLimit=${messagesLimit}&creationDate=${creationDate}`).set(authorization.headers)

        expect(response.statusCode).toBe(201)
        expect(response.body.data.messages).toBeInstanceOf(Array)

    })


})




afterAll(async () => {
    await connection.end()
    // SERVER.close()
    server.close()
})
