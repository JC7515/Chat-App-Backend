import { ACCESS_TOKEN_NAME, EMAIL_VALIDATION_TOKEN } from '../const/index.js'
import { GetDataOfToken } from '../utils/index.js'



export const verifyEmailToken = (req, res, next) => {


    const { authorization } = req.headers


    try {

        if (!authorization) {
            throw { status: 401, message: `No email token provided` }
        }

        // console.log(authorization)

        const { userId, tokenrole } = GetDataOfToken(authorization)
         

        // console.log(userId)        

        if (!userId) {
            console.log(`Could not retrieve token id`)
            throw { status: 404, message: `Could not retrieve token id`}
        }
       
        // Validamos que el token que nos esten enviando sea uno de acceso y no uno de refrescar
        if(tokenrole !== EMAIL_VALIDATION_TOKEN) throw { status: 401, message: `The token email validation has been revoked or is invalid. Please log in again.`}


        // console.log(userId, tokenrole)

        req.user = { userId, tokenrole }

        next()

    } catch (error) {
        console.error('Se produjo un error en el middleware /verifyEmailToken :', error);
        
        // if(error === 'jwt malformed' ){
        //   return res.status(error?.status || 500)
        //   .send({ status: "FAILED", data: { error:  message: ''} } });     
        // }

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}


