import {config} from 'dotenv'

config()

export const AWS_S3_BUCKET_NAME =  process.env.AWS_S3_BUCKET_NAME
export const AWS_S3_BUCKET_REGION =  process.env.AWS_S3_BUCKET_REGION
export const AWS_S3_PUBLIC_KEY =  process.env.AWS_S3_PUBLIC_KEY
export const AWS_S3_SECRET_KEY =  process.env.AWS_S3_SECRET_KEY
export const AWS_SES_IDENTITY_NAME = process.env.AWS_SES_IDENTITY_NAME
export const AWS_SES_IDENTITY_REGION = process.env.AWS_SES_IDENTITY_REGION
export const AWS_SES_PUBLIC_KEY =  process.env.AWS_SES_PUBLIC_KEY
export const AWS_SES_SECRET_KEY =  process.env.AWS_SES_SECRET_KEY
export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PORT = process.env.REDIS_PORT
export const SERVER_PORT = process.env.SERVER_PORT
export const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT
export const RESEND_KEY = process.env.RESEND_KEY
