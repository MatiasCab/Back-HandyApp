import { getDB } from "../services/sqlDatabase";


const database = getDB();

export async function deleteExpireUnverifiedUsers() {
    const queryStatement =  `DELETE FROM non_verified_users AS U
                             WHERE verify_code_expiration < CURRENT_DATE;`;
    await database.query(queryStatement);
}

export async function existUserVerifiedOrUnverified(email: string, username: string, cedula: number) {
    const queryStatement =  `SELECT * 
                             FROM non_verified_users AS U, users AS P
                             WHERE U.email = '${email}' OR U.username = '${username}' OR
                             U.id_card_number = ${cedula} OR P.email = '${email}' OR P.username = '${username}' 
                             OR P.id_card_number = ${cedula};`;
    
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    const [id] = result.rows[0];
    return id;
}

export async function existReferralCode(referralCode: any) {
    const queryStatement =  `SELECT *
                             FROM users AS P
                             WHERE P.referral_code = ${referralCode};`;
    
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    const [id] = result.rows[0];
    return id;
}

export async function existVerificationCode(verificationCode: string) {
    await deleteExpireUnverifiedUsers();
    const queryStatement =  `SELECT U.username, U.referral_code
                             FROM non_verified_users AS U
                             WHERE U.verify_code = ${verificationCode};`;
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}

export async function existUserCredentials(cedula: number) {
    const queryStatement =  `SELECT P.id, P.username, P.hashed_password
                             FROM users AS P
                             WHERE P.id_card_number = ${cedula};`;
    
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}
