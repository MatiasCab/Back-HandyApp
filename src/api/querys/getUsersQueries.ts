import { getImageURL } from "../helpers/imagesHelper";
import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function generateModel(rows: any, actualUserId: number) {
    const users: any = [];
    for (const user of rows) {
        const friendsAmount = await getUserFriendsAmount(actualUserId);
        const image = await getImageURL(user.profile_picture_name);
        console.log("USUARIOOOO",user);
        let userModel: any = {
            id: user.id,
            firstname: user.firstname,
            username: user.username,
            lastname: user.lastname,
            singupDate: user.admission_date,
            email: user.email,
            description: user.description,
            profileImage: image ? image.imageURL : null,
            fiendshipStatus: actualUserId != user.id ? user.friendship_status : null,
            skills: user.skills[0].id != null ? user.skills : [],
            friendsAmount: friendsAmount!.toString(),
            CI: null
        };
        
        if (userModel.id == actualUserId) {
            userModel.CI = user.id_card_number;
        }
        users.push(userModel);
      }
    return users;
}

function query(onlyOne, actualUser, userRequested?) {
    const queryStatement = `SELECT U.id,
                            U.firstname,
                            U.id_card_number,
                            U.username,
                            U.lastname,
                            U.birthday,
                            U.referred_id,
                            U.email,
                            U.admission_date,
                            U.description,
                            U.profile_picture_name,
                            CASE
                                WHEN F.accepted IS NULL THEN 0
                                WHEN F.accepted IS NOT NULL AND F.accepted = TRUE THEN 1
                                WHEN ${actualUser} = F.receiving_user_id AND F.accepted = FALSE THEN 2
                                WHEN ${actualUser} = F.requesting_user_id AND F.accepted = FALSE THEN 3
                            END AS friendship_status,
                            ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM users AS U
                            LEFT JOIN friends AS F 
                            ON (U.id = F.requesting_user_id OR U.id = F.receiving_user_id) 
                            AND (${actualUser} = F.requesting_user_id OR ${actualUser} = F.receiving_user_id) 
                            AND '${actualUser}' <> '${userRequested}'
                            LEFT JOIN users_skills AS S ON U.id = S.user_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            ${onlyOne ? `WHERE U.id = ${userRequested}` : `WHERE U.id = U.id`}
                             GROUP BY U.id, F.accepted, F.receiving_user_id, F.requesting_user_id;`;
    console.log(queryStatement);
    return queryStatement;
}

export async function selectUserById(userRequested, actualUser) {;
    const queryStatement = query(true, actualUser, userRequested);

    const result = await database.query(queryStatement);
    const [userModel] = await generateModel(result.rows, actualUser);
    return userModel;
}

export async function getAllUsers(actualUser) {;
    const queryStatement = query(false, actualUser);

    const result = await database.query(queryStatement);
    return await generateModel(result.rows, actualUser);
}

export async function getUserFriendsAmount(userId) {;
    const queryStatement = `SELECT COUNT(F.accepted) AS count 
                            FROM friends AS F
                            WHERE (F.requesting_user_id = ${userId} OR F.receiving_user_id = ${userId}) AND F.accepted = TRUE;`;

    const result = await database.query(queryStatement);
    console.log(result);
    return result.rows[0].count;
}

export async function getUserByUsername(username: string) {
    const queryStatement = `SELECT * FROM users WHERE username = '${username}';`;
    
    const result = await database.query(queryStatement);
    console.log(queryStatement,result);
    return result.rows[0];
}