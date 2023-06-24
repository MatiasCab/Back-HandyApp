import { getDB } from "../services/sqlDatabase";

const database = getDB();

export async function createUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `INSERT INTO friends (requesting_user_id, receiving_user_id)
                            VALUES (${actualUserId}, ${otherUserId})
                            ON CONFLICT DO NOTHING;`;
    
    await database.query(queryStatement);
}


export async function acceptUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `UPDATE friends
                            SET accepted = TRUE
                            WHERE requesting_user_id = ${otherUserId} AND receiving_user_id = ${actualUserId};`;
    console.log(queryStatement);
    await database.query(queryStatement);
}

export async function deleteUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `DELETE FROM friends
                            WHERE (requesting_user_id = ${otherUserId} AND receiving_user_id = ${actualUserId}) 
                            OR (requesting_user_id = ${actualUserId} AND receiving_user_id = ${otherUserId});`;
    console.log(queryStatement);
    await database.query(queryStatement);
}
