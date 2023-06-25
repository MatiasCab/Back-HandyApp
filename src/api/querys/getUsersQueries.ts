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
        console.log("UBICACOPPPMOM",userLocation);
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
            friendshipStatus: actualUserId != user.id ? user.friendship_status : null,
            skills: user.skills[0].id != null ? user.skills : [],
            friendsAmount: friendsAmount!.toString(),
            CI: null
        };

        if (userModel.id == actualUserId) {
            userModel.CI = user.id_card_number;
            userModel.lat = userLocation?.lat;
            userModel.lng = userLocation?.lng;
            
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
    console.log("HOLAAAAAAAA",value);
    let statement = ` AND NOT EXISTS (
                        SELECT 1
                        FROM skills AS SK
                        WHERE SK.id IN (`;
    let pass = false;
    value.forEach(skill => {
        if (!skill.includes("'") && skill != '') {
            statement += `${skill},`;
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
    if (value == 'stranger') return query + '2 OR friendship_status = 3 OR friendship_status = 0)';
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

function paginationSection(paginationInfo) {
    if(!paginationInfo) return '';
    return `OFFSET ${paginationInfo.start}
            LIMIT ${paginationInfo.end}`;
}

function query(onlyOne, actualUser, pageInfo?: { start: number, end: number }, userRequested?, filters?) {
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
                                    WHEN $1 = F.receiving_user_id AND F.accepted = FALSE THEN 2
                                    WHEN $1 = F.requesting_user_id AND F.accepted = FALSE THEN 3
                                END AS friendship_status,
                                ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                                FROM users AS U
                                LEFT JOIN friends AS F 
                                ON (U.id = F.requesting_user_id OR U.id = F.receiving_user_id) 
                                    AND ($1 = F.requesting_user_id OR $1 = F.receiving_user_id) 
                                    AND $1 <> $2
                                LEFT JOIN users_skills AS S ON U.id = S.user_id
                                LEFT JOIN skills AS L ON S.skill_id = L.id
                                ${onlyOne ? `WHERE U.id = $2` : `WHERE U.id = U.id`} 
                                AND U.id <> '${ onlyOne ? -1 : actualUser}'
                                ${onlyOne ? '' : generateFiltersInUsersQuery(filters)}
                                GROUP BY U.id, F.accepted, F.receiving_user_id, F.requesting_user_id
                                ${paginationSection(pageInfo)}
                                ) AS subquery
                                WHERE id = id ${onlyOne ? '' : generateFriendFiltersInUsersQuery(filters)}`;

    return {queryStatement, values: [actualUser, userRequested ? userRequested : -1]};
}

export async function selectUserById(userRequested, actualUser) {
    const queryInfo = query(true, actualUser, undefined, userRequested);

    console.log(queryInfo.values);
    const result = await database.query(queryInfo.queryStatement, queryInfo.values);
    const [userModel] = await generateModel(result.rows, actualUser);
    return userModel;
}

export async function getAllUsers(actualUser, pageInfo: { start: number, end: number }, filters?) {
    const queryInfo = query(false, actualUser, pageInfo, undefined, filters);

    console.log(queryInfo);
    const result = await database.query(queryInfo.queryStatement, queryInfo.values);
    return await generateModel(result.rows, actualUser);
}

export async function getUserFriendsAmount(userId) {
    ;
    const queryStatement = `SELECT COUNT(F.accepted) AS count 
                            FROM friends AS F
                            WHERE (F.requesting_user_id = $1 OR F.receiving_user_id = $1) AND F.accepted = TRUE;`;

    const result = await database.query(queryStatement, [userId]);

    return result.rows[0].count;
}

export async function getUserByUsername(username: string) {
    const queryStatement = `SELECT * FROM users WHERE username = $1;`;

    const result = await database.query(queryStatement, [username]);

    return result.rows[0];
}

export async function getUserLocation(userId: number) {
    const queryStatement = `SELECT L.lat, L.lng 
                            FROM users AS U
                            JOIN locations AS L ON U.location_id = L.id
                            WHERE U.id = $1;`;

    const result = await database.query(queryStatement, [userId]);

    return result.rows[0];
}