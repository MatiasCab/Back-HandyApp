import { getDB } from "../services/sqlDatabase";
import { getUserIdByUsername, selectUserById } from "./getUsersQuerys";

const database = getDB();

async function generateModel(rows: any) {
    const reviews: any = [];
    for (const review of rows) {
        const [reviewedUser] = await selectUserById(review[5], 9);
        let reviewModel: any = {
            id: review[0],
            description: review[1],
            score: review[2],
            problemId: review[3],
            creatorId: review[4],
            solver: {
                id: review[5],
                username: reviewedUser.username,
                name: reviewedUser.name,
                profileImage: reviewedUser.profileImage
            }
        };
        reviews.push(reviewModel);
    }
    return reviews;
}

export async function insertReview(description: string, score: number, problemId: number, creatorUserId: number, solverUserName: string) {
    const [reviewedUserId] = await getUserIdByUsername(solverUserName);
    const queryStatement = `INSERT INTO reviews (description, score, problem_id, creator_id, solver_user_ID)
                            SELECT '${description}', ${score}, ${problemId}, ${creatorUserId}, ${reviewedUserId}
                            FROM users AS U, problems AS P
                            WHERE U.id = ${creatorUserId} AND P.creator_id = U.id AND P.id = ${problemId}
                            RETURNING *;`;
    const result = await database.query(queryStatement);
    console.log(result.rows);
    return await generateModel(result.rows);
}


export async function selectProblemReviews(problemId: number) {
    const queryStatement = `SELECT * FROM reviews WHERE problem_id = ${problemId};`;
    
    const result = await database.query(queryStatement);
    console.log("reviews de los problemas", result.rows);
    return await generateModel(result.rows);
}

export async function selectUserReviews(userId: number) {
    const queryStatement = `SELECT * FROM reviews WHERE solver_id = ${userId};`;
    
    const result = await database.query(queryStatement);
    console.log("reviews de los problemas", result.rows);
    return await generateModel(result.rows);
}
