import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

import { getDB } from '../services/sqlDatabase';
import { sendVerificationCode } from "../services/emailService";

import { dateFormater } from "../helpers/utils";


const EXPIRE_TOKEN = 60 * 60;

export const addUserToVerify = async (req: Request, res: Response) => {
    const database = getDB();
    const { username, name, lastname, email, password } = req.body;
    const queryCheckStatement = `call spCheckUnverifiedAndVerifiedUsers('${email}', '${username}')`;

    try {
        if (!username || !name || !lastname || !email || !password) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
        } else {
            const [user] = await database.query(queryCheckStatement);

            if (user[0][0]) {
                res.status(400).send({ error: true, message: `Already exists a user with the email: ${email}  or username: ${username}`, name: 'CredentialsAlredyExistsError' });
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);

                const verificationCode = await sendVerificationCode(email);

                if(verificationCode == -1){
                    res.status(500).send({error: true, message: 'Verification code can not be created.'});
                    return;
                }

                const expireDate = dateFormater(new Date(Date.now() + 60 * 60 * 1000));

                const queryStatement = `call spAddUserToVerify('${verificationCode}', '${expireDate}' ,'${username}', '${name}', '${lastname}', '${email}', '${hashedPassword}')`;

                await database.query(queryStatement);

                res.status(200).send({ error: false, message: "Verification code send." });
            }
        }

    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error", name: 'ServerError' });
    }
}

export const userVerification = async (req, res) => {
    const database = getDB();
    const { verificationCode } = req.body;

    try {

        if (!verificationCode && verificationCode.length < 5) {
            res.status(400).send({ error: true, message: 'Verification code have an incorrect format.', name: "InvalidVerificationCode" });
        } else {
            const verifyCodeQuery = `CALL spVerifyUniqueCode('${verificationCode}')`;
            const [verificationResult] = await database.query(verifyCodeQuery);

            if (!verificationResult[0][0]) {

                res.status(400).send({ error: true, message: 'Verification code is invalid.', name: "InvalidVerificationCode" });

            } else {

                const queryStatement = `call spAddUserVerified(${verificationCode})`;
                await database.query(queryStatement);

                res.status(200).send({ error: false, message: 'User created!!' });

            }
        }
    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error", name: 'ServerError' });
    }
}

function generateJWT(userId: number, username: string) {

    const payload = { userId, username };
    const token = jwt.sign(payload, process.env.PRIVATE_KEY!, {
        expiresIn: EXPIRE_TOKEN
    });

    return token;
}

export const userLogin = async (req: Request, res: Response) => {
    const database = getDB();
    const { password, username } = req.body;

    const queryCheckStatement = `call spCheckVerifiedUser('', '${username}')`;

    try {
        const [user] = await database.query(queryCheckStatement);

        if (user[0][0]) {

            const { userId, username, hashedPassword } = user[0][0];

            const validPassword = bcrypt.compareSync(password, hashedPassword);

            if (validPassword) {
                const token = generateJWT(userId, username);

                const userInfo = {
                    userID: userId,
                    token: token,
                    expiresIn: EXPIRE_TOKEN
                };

                res.status(200).send(userInfo);

            } else {
                res.status(400).send({ error: true, message: 'Wrong username or password.', name: 'InvalidUsernameOrPassword' });
            }

        } else {
            res.status(400).send({ error: true, message: 'Wrong username or password.', name: 'InvalidUsernameOrPassword' });
        }

    } catch (e) {
        res.status(500).send({ error: true, message: "Internal server error", name: 'ServerError' });
    }
}