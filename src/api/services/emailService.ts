import * as nodemailer from 'nodemailer';
import dotenv from "dotenv";
//import { google } from 'googleapis';
import { existVerificationCode } from "../querys/verificationsQueries";

dotenv.config();

// const OAuth2 = google.auth.OAuth2;
// const sourceEmail = '';

/* async function createTransporter() {
    const auth = new OAuth2(
        process.env.GC_CLIENT_ID,
        process.env.GC_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    auth.setCredentials({
        refresh_token: process.env.GC_REFRESH_TOKEN
    });

    const accessToken = await auth.getAccessToken()

    const transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: sourceEmail,
            pass: process.env.GC_MAIL_PASSWORD,
            clientId: process.env.GC_CLIENT_ID,
            clientSecret: process.env.GC_CLIENT_SECRET,
            refreshToken: process.env.GC_REFRESH_TOKEN,
            accessToken: accessToken
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    return transporter;
}
 */
const user = process.env.MAILER_EMAIL;
const pass = process.env.MAILER_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
        user: user,
        pass: pass
    },tls: {
        rejectUnauthorized: false
    }
});

async function createVerificationCode() {
    let attempts = 0;
    while (attempts < 10000) {
        const code = (Date.now() / 100000).toString().split(".")[1];
        const existCode = await existVerificationCode(code);
        if (!existCode) {
            return code;
        }

        attempts++;
    };
    return -1;
}

export async function sendVerificationCode(email: string) {
    const verificationCode = await createVerificationCode();

    if (verificationCode == -1) {
        return verificationCode;
    }

    transporter.sendMail({
        from: `"Handy 🖐️" <${user}>`,
        to: `${email}`,
        subject: "Codigo de verificación ✔",
        text: `Su codigo de verificacion es: ${verificationCode}`
    });

    return verificationCode;
}