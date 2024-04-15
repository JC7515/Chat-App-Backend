import connection from "../../connectionDb.cjs";
import { GetFileUrl } from "../../s3.js";
import users from "../databases/users.js";


const getUserToSearch = async (sql, dataForQuery) => {

    try {
        
        const resultsOfNameSearched = await users.getUserToSearch(sql, dataForQuery)

        let ListOfUserFounds = []

        if (resultsOfNameSearched.length > 0) {

            ListOfUserFounds = await Promise.all(
                resultsOfNameSearched.map(async (user) => {
                    let profilePictureUrl = '/'

                    try {

                        if (user.profile_picture) {
                            profilePictureUrl = await GetFileUrl(user.profile_picture, 88000)
                            // console.log(profilePictureUrl)

                            return {
                                ...user,
                                profile_picture: profilePictureUrl
                            }
                        }

                        return {
                            ...user,
                            profile_picture: profilePictureUrl
                        }

                    } catch {
                        // throw { status: 500, message: `Could not retrieve user profile information, please reload the page.` }
                        return {
                            ...user,
                            profile_picture: '/'
                        }
                    }
                })
            )

        }


        return ListOfUserFounds


    } catch (error) {
        throw error
    }
} 




const updateUserSocketId = async (sql, dataForQuery) => {

    try {
        
       const result = await users.updateUserSocketId(sql, dataForQuery)

       return result
       

    } catch (error) {
        throw error
    }
}


export default { getUserToSearch, updateUserSocketId }