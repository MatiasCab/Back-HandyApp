import { dateFormater } from "../helpers/utils";
import { getDB } from "../services/sqlDatabase";
import { getUbicationId } from "./createProblemsQueries";
import { existReferralCode, existVerificationCode } from "./verificationsQueries";

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

async function createUserSkillsAssociations(skills: any, userId: any) {
    for (let index = 0; index < skills.length; index++) {
        const queryStatement = `INSERT INTO users_skills (user_id, skill_id)
                                VALUES ($1, $2)
                                ON CONFLICT DO NOTHING;`;
        const values = [userId, skills[index]];
        await database.query(queryStatement, values);
    }
}
async function deleteUserSkillsAssociations(userId: number) {
    const queryStatement = `DELETE FROM users_skills AS S
                            WHERE S.user_id = $1;`;
    await database.query(queryStatement, [userId]);
}

async function deleteUnverifiedUser(verificationCode: string) {
    const queryStatement = `DELETE FROM non_verified_users AS U
                            WHERE U.verify_code = $1;`;
    
    await database.query(queryStatement, [verificationCode]);
}

async function updateReferrerID(verificationCode: string, email: string) {
    const result = await existVerificationCode(verificationCode, email);
    const username = result.username;
    const referralCode = result.referral_code;

    const referrerId = await existReferralCode(referralCode);
    const queryStatement = `UPDATE users
                            SET referred_id = $1
                            WHERE username = $2;`
    
    const values = [referrerId, username];
    console.log(queryStatement);
    await database.query(queryStatement,values);
}

export async function insertUserToVerify(cedula: number, username: string,	name: string, lastname: string, birthday: string, referralCode: number, email: string, hashedPassword: string, verificationCode: string) {
    const expireDate = dateFormater(new Date(Date.now() + 60 * 60 * 1000));
    const queryStatement = `INSERT INTO non_verified_users 
                            (id_card_number, username,	firstname, lastname, birthday, referral_code, email, hashed_password, verify_code, verify_code_expiration)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;
    
    const values = [cedula, username, name, lastname, birthday, referralCode, email, hashedPassword, verificationCode, expireDate];
    console.log(queryStatement);
    await database.query(queryStatement, values);
}

export async function insertUserVerified(verificationCode: string, email: string) {
    const referralCode = await generateReferralCode();
    console.log(referralCode);
    const queryStatement = `INSERT INTO users (id_card_number, username, firstname, lastname, birthday, email, hashed_password, referral_code)
                            SELECT id_card_number, username, firstname, lastname, birthday, email, hashed_password, $1
                            FROM non_verified_users AS U
                            WHERE U.verify_code = $2;`;
    
    await database.query(queryStatement, [referralCode, verificationCode]);
    await updateReferrerID(verificationCode, email);
    await deleteUnverifiedUser(verificationCode);
}

export async function updateUser(description: string, lat: number, lng: number, skills: any, userId: number, pictureName?: string) {
    const ubicationId = await getUbicationId(lat, lng);
    const picture = pictureName ? pictureName : 'profile_picture_name';
    const queryStatement = `UPDATE users
                            SET profile_picture_name = $1,
                                description = $2,
                                location_id = $3
                            WHERE id = $4
                            RETURNING id;`;
    console.log(queryStatement);
    const values = [picture, description, ubicationId, userId];
    const result = await database.query(queryStatement, values);
    if (result.rows.length < 1) { return; }
    await deleteUserSkillsAssociations(userId);
    await createUserSkillsAssociations(skills, userId);
}

export async function changeUserPassword(password: string, userId: number) {
    const queryStatement = `UPDATE users
                            SET hashed_password = $1
                            WHERE id = $2;`;
    await database.query(queryStatement, [password, userId]);
}
