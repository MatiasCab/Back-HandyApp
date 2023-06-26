import { getDB } from "../services/sqlDatabase";


const database = getDB();

export async function deleteExpireUnverifiedUsers() {
    const queryStatement =  `DELETE FROM non_verified_users AS U
                             WHERE verify_code_expiration < CURRENT_DATE;`;
    await database.query(queryStatement);
}

async function existNonVerifiedUser(email: string, username: string, cedula: number){
    let queryStatement =  ` SELECT * 
                            FROM non_verified_users AS U
                            WHERE U.email = $1 OR U.username = $2 OR
                            U.id_card_number = $3;`;

    const values = [email, username, cedula];
    const result = await database.query(queryStatement, values);
    return result.rows[0];
}

async function existVerifiedUser(email: string, username: string, cedula: number){
    let queryStatement =  ` SELECT * 
                            FROM users AS P
                            WHERE P.email = $1 OR P.username = $2
                            OR P.id_card_number = $3;`;

    const values = [email, username, cedula];
    const result = await database.query(queryStatement, values);
    return result.rows[0];
}

export async function existUserVerifiedOrUnverified(email: string, username: string, cedula: number) {
    const result1 = await existNonVerifiedUser(email, username, cedula);
    if(result1) { return true; }
    const result2 = await existVerifiedUser(email, username, cedula);
    if(result2) { return true; }
    return false;
}

export async function existReferralCode(referralCode: any) {
    const queryStatement =  `SELECT *
                             FROM users AS P
                             WHERE P.referral_code = $1;`;
    
    const result = await database.query(queryStatement, [referralCode]);
    if(result.rows.length == 0) { return; }
    const {id} = result.rows[0];
    return id;
}

export async function existVerificationCode(verificationCode: string, email?: string) {
    await deleteExpireUnverifiedUsers();
    const queryStatement =  `SELECT U.username, U.referral_code
                             FROM non_verified_users AS U
                             WHERE U.verify_code = $1 AND U.email = '${ email ? email: 'U.email' }';`;                      
    const result = await database.query(queryStatement, [verificationCode]);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}

export async function existUserCredentials(cedula: number) {
    const queryStatement =  `SELECT P.id, P.username, P.hashed_password
                             FROM users AS P
                             WHERE P.id_card_number = $1;`;
    
    const result = await database.query(queryStatement, [cedula]);
    if(result.rows.length == 0) { return; }
    return result.rows[0];
}
