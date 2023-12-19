export const authorize = (req, res, next) => {

    //#region 
    // const requestUrl = req.originalUrl
    // let obtainedRole = ''

    // if (req.user) {
    //     const { role } = req.user

    //     obtainedRole = role
    // }

    // if (req.admin) {
    //     const { role } = req.admin

    //     obtainedRole = role
    // }

    // const routesProhibited = {
    //     user: new Set(['/v1/adminData','/v1/AudiovisualMedia','/v1/AudiovisualMedia/:id/:table']),
    //     admin: new Set(['/favorites/:user_id', '/favorites', '/dislikes', '/dislikes/:user_id', '/likes/:user_id', '/likes', '/login', '/adminLogin', '/suscription', '/checkoutSession', '/validatePaymentStatus/:user_id', '/movieVideo/:movie_title', '/password', '/updateProfilePicture/:id', '/userData', '/chapterVideo', '/serieChapters/:serie_title', '/signUp'  ])
    // }



    try {


        // if(!['user', 'admin'].includes(obtainedRole)) {
        //     throw { status: 401, message: `Invalid role: ${obtainedRole}` }
        // }


        // if(routesProhibited[obtainedRole].has(requestUrl)){
        //     throw { status: 401, message: `Unauthorized ${obtainedRole} to access this resource` }
        // }

        //#endregion

        next()

    } catch (error) {
        console.error('Se produjo un error en el middleware /authorize :', error);

        res.status(error?.status || 500)
            .send({ status: "FAILED", data: { error: error?.message || error } });
    }
}


