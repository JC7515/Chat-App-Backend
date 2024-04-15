import request from "supertest";
import SERVER from '../../index.js'
import connection from "../../connectionDb.cjs";
import { server } from "../../socketIo.js";
import { SERVER_PORT } from "../../configEnv.js";


export let userData;
export let authToken;

beforeAll(async () => {
    
    // server.listen( SERVER_PORT, () => {
    //     console.log(`el servidor esta corriendo el puesto ${SERVER_PORT}`)
    // })

    const dataForLogin = {
        email: 'test.1234@gmail.com',
        password: 'Test123456'
    }
    const respons = await request(server).post("/v1/auth/login").send(dataForLogin)

    authToken = respons.body.data.access_token

    expect(respons.statusCode).toBe(201)
    expect(typeof respons.body.data.access_token).toBe('string')

    const authorization = {
        headers: {
            'authorization': `Bearer ${authToken}`,
        }
    }

    const response = await request(server).get('/v1/auth/profile').set(authorization.headers)

    userData = response.body.data

    // console.log(response.body.data)
    // console.log(userData)

    expect(response.statusCode).toBe(201)


})


afterAll(async () => {
    await connection.end()
    // SERVER.close()
    server.close()
})

describe('GET /v1/contacts', () => {


    it('Should get only one contact selected', async () => {

        const chatIdTest = 'bfbf76fa-5586-4f48-9e49-30481ba01320'

        const contactUserIdTest = "e9186e6f-88a7-490d-ac0d-b49f6ab7c15d"

        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/contacts/?chatId=${chatIdTest}&contactUserId=${contactUserIdTest}`).set(authorization.headers)

        expect(response.statusCode).toBe(201)

    })

})


describe('GET /v1/contacts/list', () => {


    it('Should get only one contact selected', async () => {

        const chatIdTest = 'bfbf76fa-5586-4f48-9e49-30481ba01320'

        const contactUserIdTest = "e9186e6f-88a7-490d-ac0d-b49f6ab7c15d"

        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/contacts/list`).set(authorization.headers)

        expect(response.statusCode).toBe(201)
        expect(response.body.data.contacts_list).toBeInstanceOf(Array)

    })

})


describe('GET /v1/contacts/list', () => {


    it('Should get only one contact selected', async () => {

        const chatIdTest = 'bfbf76fa-5586-4f48-9e49-30481ba01320'

        const contactUserIdTest = "e9186e6f-88a7-490d-ac0d-b49f6ab7c15d"

        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/contacts/list`).set(authorization.headers)

        expect(response.statusCode).toBe(201)
        expect(response.body.data.contacts_list).toBeInstanceOf(Array)

    })

})



afterAll(async () => {
    await connection.end()
    // SERVER.close()
    server.close()
})
