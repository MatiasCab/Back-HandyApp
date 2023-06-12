import { dateFormater } from "../helpers/utils";
import { getDB } from "../services/sqlDatabase";
import { existReferralCode, existVerificationCode } from "./verificationsQuerys";

const database = getDB();

async function deleteUnverifiedUser(verificationCode: string) {
    const queryStatement = `DELETE FROM unverified_users AS U
                            WHERE U.verification_code = ${verificationCode};`;
    
    await database.query(queryStatement);
}

async function updateReferrerID(verificationCode: string) {
    const [username, referralCode] = await existVerificationCode(verificationCode) as [string, number];
    const referrerId = await existReferralCode(referralCode);
    const queryStatement = `UPDATE users
                            SET referrer_id = ${referrerId}
                            WHERE username = '${username}';`
    await database.query(queryStatement);
}

export async function insertUserToVerify(cedula: number, username: string,	name: string, lastname: string, birthday: string, referralCode: number, email: string, hashedPassword: string, verificationCode: string) {
    const expireDate = dateFormater(new Date(Date.now() + 60 * 60 * 1000));
    const queryStatement = `INSERT INTO unverified_users 
                            (cedula, username,	name, lastname, birthday, referral_code, email, hashed_password, verification_code, expire_date_code)
                            VALUES (${cedula}, '${username}', '${name}', '${lastname}', '${birthday}', ${referralCode}, '${email}', '${hashedPassword}', ${verificationCode}, '${expireDate}');`;
    
    await database.query(queryStatement);
}

export async function insertUserVerified(verificationCode: string) {
    const queryStatement = `INSERT INTO users (cedula, username, name, lastname, birthday, email, hashed_password)
                            SELECT cedula, username, name, lastname, birthday, email, hashed_password
                            FROM unverified_users AS U
                            WHERE U.verification_code = ${verificationCode};`;
    
    await database.query(queryStatement);
    await updateReferrerID(verificationCode);
    await deleteUnverifiedUser(verificationCode);
}