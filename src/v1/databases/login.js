import connection from "../../connectionDb.cjs";
import { ComparatePassword, GenerateAccessToken, GenerateRefreshToken } from "../utils/index.js";


export const generateAccessToken = async (req, res) => {

    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}