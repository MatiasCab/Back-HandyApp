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
                                VALUES (${userId}, ${skills[index]})
                                ON CONFLICT DO NOTHING;`;
        await database.query(queryStatement);
    }
}
async function deleteUserSkillsAssociations(userId: number) {
    const queryStatement = `DELETE FROM users_skills AS S
                            WHERE S.user_id = ${userId};`;
    await database.query(queryStatement);
}

async function deleteUnverifiedUser(verificationCode: string) {
    const queryStatement = `DELETE FROM non_verified_users AS U
                            WHERE U.verify_code = ${verificationCode};`;
    
    await database.query(queryStatement);
}

async function updateReferrerID(verificationCode: string, email: string) {
    const result = await existVerificationCode(verificationCode, email);
    const username = result.username;
    const referralCode = result.referral_code;

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
    
                            console.log(queryStatement);
    await database.query(queryStatement);
}

export async function insertUserVerified(verificationCode: string, email: string) {
    const referralCode = await generateReferralCode();
    console.log(referralCode);
    const queryStatement = `INSERT INTO users (id_card_number, username, firstname, lastname, birthday, email, hashed_password, referral_code)
                            SELECT id_card_number, username, firstname, lastname, birthday, email, hashed_password, ${referralCode}
                            FROM non_verified_users AS U
                            WHERE U.verify_code = ${verificationCode};`;
    
    await database.query(queryStatement);
    await updateReferrerID(verificationCode, email);
    await deleteUnverifiedUser(verificationCode);
}

export async function updateUser(description: string, lat: number, lng: number, skills: any, userId: number, pictureName?: string) {
    const ubicationId = await getUbicationId(lat, lng);
    const picture = pictureName ? pictureName : 'profile_picture_name';
    const queryStatement = `UPDATE users
                            SET profile_picture_name = '${picture}',
                                description = '${description}',
                                location_id = ${ubicationId}
                            WHERE id = ${userId}
                            RETURNING id;`;
    console.log(queryStatement);
    const result = await database.query(queryStatement);
    if (result.rows.length < 1) { return; }
    await deleteUserSkillsAssociations(userId);
    await createUserSkillsAssociations(skills, userId);
}

export async function changeUserPassword(password: string, userId: number) {
    const queryStatement = `UPDATE users
                            SET hashed_password = '${password}'
                            WHERE id = ${userId};`;
    await database.query(queryStatement);
}
