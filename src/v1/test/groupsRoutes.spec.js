import request from "supertest";
import { SERVER_PORT } from "../../configEnv.js";
import connection from "../../connectionDb.cjs";
import { server } from "../../socketIo.js";
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

//     console.log(authToken)

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


describe('GET /v1/groups', () => {


    it('Should get only one contact selected', async () => {


        // console.log(userData)
        // console.log(authToken)

        const authorization = {
            headers: {
                'authorization': `Bearer ${authToken}`,
            }
        }

        const response = await request(server).get(`/v1/groups`).set(authorization.headers)

        expect(response.statusCode).toBe(201)
        expect(response.body.data.groups_list).toBeInstanceOf(Array)

    })

})



afterAll(async () => {
    await connection.end()
    // SERVER.close()
    server.close()
})

