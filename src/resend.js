import { Resend } from 'resend'
import { RESEND_KEY } from './configEnv.js';

const resend = new Resend(RESEND_KEY);

export const SendEmailValidation = async (recipientEmail, validationUrl) => {
    try {

        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [recipientEmail],
            subject: 'Account Verification for Chatify',
            html: `
            <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">

            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h1 style="color: #3498db;">Welcome to Chatify</h1>
            <p style="color: #555555;">Thank you for registering with Chatify! To complete your registration, we need to verify your email address.</p>
    
            <a href="${validationUrl}" style="display: inline-block; background-color: #3498db; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Verify Email</a>
    
            <p style="color: #555555; margin-top: 20px;">If you did not request this registration, you can ignore this email.</p>
    
            <p style="color: #555555;">Thank you!</p>
            <p style="color: #555555;">The team at Chatify</p>
            </div>
        </div> `,
        });

        if (error) {
            throw error
        }

        return data

    } catch (err) {
        // aqu devolvemos el error
        console.error({ err });
        return err;
    }


};
