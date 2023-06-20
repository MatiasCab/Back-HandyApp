import { dateFormater } from "../helpers/utils";
import { getDB } from "../services/sqlDatabase";
import { existReferralCode, existVerificationCode } from "./verificationsQuerys";

const database = getDB();

async function generateReferralCode() {
    while (true) {
        const code = (Date.now() / 100000).toString().split(".")[1];
        const existCode = await existReferralCode(code);
        if (!existCode) {
            return code;
        }
    };
}

async function deleteUnverifiedUser(verificationCode: string) {
    const queryStatement = `DELETE FROM non_verified_users AS U
                            WHERE U.verify_code = ${verificationCode};`;
    
    await database.query(queryStatement);
}

async function updateReferrerID(verificationCode: string) {
    const [username, referralCode] = await existVerificationCode(verificationCode) as [string, number];
    console.log("PRIMERRRRR", referralCode);
    const referrerId = await existReferralCode(referralCode);
    const queryStatement = `UPDATE users
                            SET referred_id = ${referrerId}
                            WHERE username = '${username}';`
    console.log(queryStatement);
    await database.query(queryStatement);
}

export async function insertUserToVerify(cedula: number, username: string,	name: string, lastname: string, birthday: string, referralCode: number, email: string, hashedPassword: string, verificationCode: string) {
    const expireDate = dateFormater(new Date(Date.now() + 60 * 60 * 1000));
    const queryStatement = `INSERT INTO non_verified_users 
                            (id_card_number, username,	firstname, lastname, birthday, referral_code, email, hashed_password, verify_code, verify_code_expiration)
                            VALUES (${cedula}, '${username}', '${name}', '${lastname}', '${birthday}', ${referralCode}, '${email}', '${hashedPassword}', ${verificationCode}, '${expireDate}');`;
    
    await database.query(queryStatement);
}

export async function insertUserVerified(verificationCode: string) {
    const referralCode = await generateReferralCode();
    console.log(referralCode);
    const queryStatement = `INSERT INTO users (id_card_number, username, firstname, lastname, birthday, email, hashed_password, referral_code)
                            SELECT id_card_number, username, firstname, lastname, birthday, email, hashed_password, ${referralCode}
                            FROM non_verified_users AS U
                            WHERE U.verify_code = ${verificationCode};`;
    
    await database.query(queryStatement);
    await updateReferrerID(verificationCode);
    await deleteUnverifiedUser(verificationCode);
}