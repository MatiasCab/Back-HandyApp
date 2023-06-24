import { getImageURL } from "../helpers/imagesHelper";
import { getDB } from "../services/sqlDatabase";

const database = getDB();
//FIXME REGULAR LO DE LAS COMAS EN LAS CONSULTAS
async function generateModel(rows: any, actualUserId: number) {
    const users: any = [];
    for (const user of rows) {
        const friendsAmount = await getUserFriendsAmount(actualUserId);
        const imageURL = await getImageURL(user.profile_picture_name);
        const userLocation = await getUserLocation(user.id);
        let userModel: any = {
            id: user.id,
            firstname: user.firstname,
            username: user.username,
            lastname: user.lastname,
            singupDate: user.admission_date,
            email: user.email,
            description: user.description,
            lat: null,
            lng: null,
            profileImage: imageURL ? imageURL : null,
            fiendshipStatus: actualUserId != user.id ? user.friendship_status : null,
            skills: user.skills[0].id != null ? user.skills : [],
            friendsAmount: friendsAmount!.toString(),
            CI: null
        };

        if (userModel.id == actualUserId) {
            userModel.CI = user.id_card_number;
            userModel.lat = userLocation.lat;
            userModel.lng = userLocation.lng;
            
        }
        users.push(userModel);
    }
    return users;
}

function nameFilter(value) {
    if (value == '') return '';
    return ` AND U.firstname ILIKE '%${value}%'`;
}

function skillsFilter(value) {
    let statement = ` AND NOT EXISTS (
                        SELECT 1
                        FROM skills AS SK
                        WHERE SK.name IN (`;
    let pass = false;
    value.forEach(skill => {
        if (!skill.includes("'")) {
            statement += `'${skill}',`;
            pass = true;
        }
    });
    if (!pass) return '';
    statement = statement.slice(0, -1)
    return statement + `) AND NOT EXISTS (
                            SELECT 1
                            FROM users_skills AS US
                            WHERE US.user_id = U.id
                            AND US.skill_id = SK.id
                          )
                        )`;
}

function friendsFilter(value) {
    let query =` AND (friendship_status = `;

    if (value == 'friends') return query + '1)';
    if (value == 'pendent') return query + '2)';
    if (value == 'stranger') return query + '2 OR friendship_status = 3)';
    return ``;
}

function generateFiltersInUsersQuery(filters: Map<string, string>) {
    let queryFilteredStatement = '';
    queryFilteredStatement += nameFilter(filters.get('name'));
    queryFilteredStatement += skillsFilter(filters.get('skills'));

    return queryFilteredStatement;
}

function generateFriendFiltersInUsersQuery(filters: Map<string, string>) {
    let queryFilteredStatement = '';
    queryFilteredStatement += friendsFilter(filters.get('relationship')); //TODO filtro de amigos.

    return queryFilteredStatement;
}

function query(onlyOne, actualUser, userRequested?, filters?) {
    const queryStatement = `SELECT *
                            FROM (
                                SELECT U.id,
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
                                AND U.id <> '${ onlyOne ? -1 : actualUser}'
                                ${onlyOne ? '' : generateFiltersInUsersQuery(filters)}
                                GROUP BY U.id, F.accepted, F.receiving_user_id, F.requesting_user_id
                                ) AS subquery
                                WHERE id = id ${onlyOne ? '' : generateFriendFiltersInUsersQuery(filters)}`;

    return queryStatement;
}

export async function selectUserById(userRequested, actualUser) {
    ;
    const queryStatement = query(true, actualUser, userRequested);

    const result = await database.query(queryStatement);
    const [userModel] = await generateModel(result.rows, actualUser);
    return userModel;
}

export async function getAllUsers(actualUser, filters?) {
    ;
    const queryStatement = query(false, actualUser, undefined, filters);

    const result = await database.query(queryStatement);
    return await generateModel(result.rows, actualUser);
}

export async function getUserFriendsAmount(userId) {
    ;
    const queryStatement = `SELECT COUNT(F.accepted) AS count 
                            FROM friends AS F
                            WHERE (F.requesting_user_id = ${userId} OR F.receiving_user_id = ${userId}) AND F.accepted = TRUE;`;

    const result = await database.query(queryStatement);

    return result.rows[0].count;
}

export async function getUserByUsername(username: string) {
    const queryStatement = `SELECT * FROM users WHERE username = '${username}';`;

    const result = await database.query(queryStatement);

    return result.rows[0];
}

export async function getUserLocation(userId: number) {
    const queryStatement = `SELECT L.lat, L.lng 
                            FROM users AS U
                            JOIN locations AS L ON U.location_id = L.id
                            WHERE U.id = ${userId};`;

    const result = await database.query(queryStatement);

    return result.rows[0];
}