import { getDB } from "../services/sqlDatabase";

const database = getDB();

export async function createUserFriendship(otherUserId: number, actualUserId: number) {
    const queryStatement = `INSERT INTO friends (user1_id, user2_id)
                            VALUES (${actualUserId}, ${otherUserId})
                            ON CONFLICT DO NOTHING;`;
    
    await database.query(queryStatement);
}


export async function acceptUserFriendship(senderId: number, actualUserId: number) {
    const queryStatement = `UPDATE friends
                            SET accept = TRUE
                            WHERE user1_id = ${senderId} AND user2_id = ${actualUserId};`;
                            
    await database.query(queryStatement);
}
