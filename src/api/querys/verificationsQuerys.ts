import { getDB } from "../services/sqlDatabase";


const database = getDB();

export async function deleteExpireUnverifiedUsers() {
    const queryStatement =  `DELETE FROM unverified_users AS U
                             WHERE expire_date_code < CURRENT_DATE;`;
    await database.query(queryStatement);
}

export async function existUserVerifiedOrUnverified(email: string, username: string, cedula: number) {
    const queryStatement =  `SELECT * 
                             FROM unverified_users AS U, users AS P
                             WHERE U.email = '${email}' OR U.username = '${username}' OR
                             U.cedula = ${cedula} OR P.email = '${email}' OR P.username = '${username}' 
                             OR P.cedula = ${cedula};`;
    
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
                             FROM unverified_users AS U
                             WHERE U.verification_code = ${verificationCode};`;
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}

export async function existUserCredentials(cedula: number) {
    const queryStatement =  `SELECT P.id, P.username, P.hashed_password
                             FROM users AS P
                             WHERE P.cedula = ${cedula};`;
    
    const result = await database.query(queryStatement);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}
