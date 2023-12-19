import { ACCESS_TOKEN_NAME } from '../const/index.js'
import { GetDataOfToken } from '../utils/index.js'


/**
 * The ValidateToken function is a middleware in JavaScript that validates a token, retrieves the user
 * ID and profile picture from the token, and attaches them to the request object.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes properties such as headers, body, query parameters, and
 * more.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to control the response, such as
 * setting the status code, sending data, and setting headers.
 * @param next - The `next` parameter is a function that is called to pass control to the next
 * middleware function in the stack. It is typically used to move to the next middleware function after
 * the current middleware function has completed its task.
 */
export const authenticate = (req, res, next) => {


    const { authorization } = req.headers


    try {

        if (!authorization) {
            throw { status: 401, message: `No access token provided` }
        }

        console.log(authorization)

        const { userId, tokenrole } = GetDataOfToken(authorization)


        console.log(userId)        

        if (!userId) {
            console.log(`Could not retrieve token id`)
            throw { status: 404, message: `Could not retrieve token id` }
        }
       
        // Validamos que el token que nos esten enviando sea uno de acceso y no uno de refrescar
        if(tokenrole !== ACCESS_TOKEN_NAME) throw { status: 401, message: `The refresh token has been revoked or is invalid. Please log in again.`}


        console.log(userId, tokenrole)

        req.user = { userId, tokenrole }

        next()

    } catch (error) {
        console.error('Se produjo un error en el middleware /authenticate :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}


