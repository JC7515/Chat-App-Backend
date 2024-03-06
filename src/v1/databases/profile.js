import connection from "../../connectionDb.cjs";
import { DeleteFile, GetFileUrl, UploadFile } from "../../s3.js";
import { GenerateNewFileNameOfProfile, GenerateSqlToUpdateProfileData } from "../utils/index.js";


export const getUserData = async (req, res) => {

    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}


export const updateUserData = async (req, res) => {

    try {
        


    } catch (error) {
        throw { status: 500, message: error?.message || error };
    }
}