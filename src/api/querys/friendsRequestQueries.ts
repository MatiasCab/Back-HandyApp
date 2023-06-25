import { getDB } from "../services/sqlDatabase";

const database = getDB();

export async function createUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `INSERT INTO friends (requesting_user_id, receiving_user_id)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING;`;
    
    await database.query(queryStatement, [actualUserId, otherUserId]);
}


export async function acceptUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `UPDATE friends
                            SET accepted = TRUE
                            WHERE requesting_user_id = $1 AND receiving_user_id = $2;`;
    console.log(queryStatement);
    await database.query(queryStatement, [otherUserId, actualUserId]);
}

export async function deleteUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `DELETE FROM friends
                            WHERE (requesting_user_id = $1 AND receiving_user_id = $2) 
                            OR (requesting_user_id = $2 AND receiving_user_id = $1);`;
    console.log(queryStatement);
    await database.query(queryStatement, [otherUserId, actualUserId]);
}
