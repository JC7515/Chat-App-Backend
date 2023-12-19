import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { AWS_S3_BUCKET_REGION, AWS_S3_PUBLIC_KEY, AWS_S3_SECRET_KEY, AWS_S3_BUCKET_NAME } from './configEnv.js'
import  { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import  path from 'path'


const client = new S3Client({region: AWS_S3_BUCKET_REGION, credentials:{
    accessKeyId: AWS_S3_PUBLIC_KEY,
    secretAccessKey: AWS_S3_SECRET_KEY
}})

/**
 * The function `UploadFile` uploads a file to an AWS S3 bucket using the AWS SDK for JavaScript.
 * @param file - The `file` parameter is an object that represents the file to be uploaded. It should
 * have the following properties:
 * @returns the result of the `client.send(comand)` method call.
 */
export const UploadFile = async (file) => {
   const stream = fs.createReadStream(file.tempFilePath)
   
   const uploadParams = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: file.name,
    Body: stream
  }

   const comand = new PutObjectCommand(uploadParams)

   return await client.send(comand)
   
}




export const UploadBackupFileToS3 = async (file) => {
    const stream = fs.createReadStream(file.filePath)
    
    const uploadParams = {
     Bucket: AWS_S3_BUCKET_NAME,
     Key: file.name,
     Body: stream
   }
 
    const comand = new PutObjectCommand(uploadParams)
 
    return await client.send(comand)
    
 }


/**
 * The function `GetFiles` retrieves a list of files from an AWS S3 bucket.
 * @returns The function `GetFiles` is returning the result of the `client.send(comand)` method call.
 */
export const GetFiles = async () => {
    const getFilesParams = {
        Bucket: AWS_S3_BUCKET_NAME
    } 

    const comand = new ListObjectsCommand(getFilesParams)

    return await client.send(comand)
}


/**
 * The GetFile function retrieves a file from an AWS S3 bucket using the specified file name.
 * @param fileName - The `fileName` parameter is the name of the file that you want to retrieve from
 * the AWS S3 bucket.
 * @returns The function `GetFile` is returning the result of the `client.send(comand)` method call.
 */
export const GetFile = async (fileName) => {
    const getFileParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName
    } 

    const comand = new GetObjectCommand(getFileParams)

    return await client.send(comand)
}


/**
 * The function `DownloadFile` downloads a file from an AWS S3 bucket and saves it to the local file
 * system.
 * @param fileName - The `fileName` parameter is the name of the file that you want to download from
 * the AWS S3 bucket.
 */
export const DownloadFile = async (fileName) => {
    try{
        const getFileParams = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: fileName
        } 
    
        const comand = new GetObjectCommand(getFileParams)
    
        const result = await client.send(comand)
        const filePath = `./uploads/${fileName}`

        result.Body.pipe(fs.createWriteStream(filePath))
    } catch (error){
        return error
    }
}


export const DownloadBackupFilesFromS3Bucket = async (fileName) => {
    try{
        const getFileParams = {
            Bucket: AWS_S3_BUCKET_NAME,
            Key: fileName
        } 
    
        const comand = new GetObjectCommand(getFileParams)
    
        const result = await client.send(comand)
        const filePath = `./backupFilesForS3Transactions/${fileName}`
        result.Body.pipe(fs.createWriteStream(filePath))
    } catch (error){
        return error
    }
}



/**
 * The GetFileUrl function generates a signed URL for accessing a file in an AWS S3 bucket.
 * @param fileName - The `fileName` parameter is the name of the file that you want to generate a
 * signed URL for. This should be the exact name of the file including its extension.
 * @param expiresInSeconds - The `expiresInSeconds` parameter is the number of seconds for which the
 * generated URL will be valid. After this time period, the URL will expire and will no longer be
 * accessible.
 * @returns The function `GetFileUrl` returns a signed URL for accessing a file stored in an AWS S3
 * bucket.
 */
export const GetFileUrl = async (fileName, expiresInSeconds) => {
    const getFileParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName
    } 

    const comand = new GetObjectCommand(getFileParams)

    return await getSignedUrl(client, comand, { expiresIn: expiresInSeconds})

}


/**
 * The DeleteFile function deletes a file from an AWS S3 bucket.
 * @param fileName - The `fileName` parameter is the name of the file that you want to delete from the
 * AWS S3 bucket.
 * @returns the result of the `client.send(comand)` method, which is a promise.
 */
export const DeleteFile = async (fileName) => {
    const getFileParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileName
    } 

    const comand = new DeleteObjectCommand(getFileParams)

    return await client.send(comand)
}



