import { getDB } from "../services/sqlDatabase";
import { getUserByUsername} from "./getUsersQueries";

const database = getDB();


//TODO SEPARARLO PARA QUE ESTE MAS LINDO.
async function generateModel(rows: any, withFullInfo) {
    const reviews: any = [];
    console.log(rows);
    for (const fullReviewInfo of rows) {
        console.log(fullReviewInfo);
        let reviewModel: any = {
            id: fullReviewInfo.id,
            description: fullReviewInfo.description,
            score: fullReviewInfo.score,
            problemId: fullReviewInfo.problem_id,
            problemName: fullReviewInfo.name,
            creator: {
                id: fullReviewInfo.creatorid,
                firstname: fullReviewInfo.creatorname,
                creatorUsername: fullReviewInfo.creatorusername
            }
        };
        if(!withFullInfo){
            reviewModel.reviewedUser = {
                id: fullReviewInfo.solverid,
                firstname: fullReviewInfo.solvername,
                creatorUsername: fullReviewInfo.solverusername
            }
        }
        reviews.push(reviewModel);
    }
    let reviewsInfo = reviews;
    if (withFullInfo) {
        const reviewsAmount = await selectUserReviewsAmount(rows[0].solverid);
        console.log(reviewsAmount);
        console.log(reviewsAmount.happyreviews);
        reviewsInfo = {
            good: reviewsAmount.happyreviews!.toString(),
            mid: reviewsAmount.mediumreviews!.toString(),
            bad: reviewsAmount.badreviews!.toString(),
            reviewedUser: {
                id: rows[0].solverid,
                firstname: rows[0].solvername,
                creatorUsername: rows[0].solverusername
            },
            reviews: reviews
        }
    }
    return reviewsInfo;
}

export async function insertReview(description: string, score: number, problemId: number, creatorUserId: number, solverUserName: string) {
    const reviewedUser = await getUserByUsername(solverUserName);
    const queryStatement = `WITH updated_problem AS (
                                UPDATE problems
                                SET status = 'CLOSED',
                                    solver_id =  ${reviewedUser.id},
                                    resolved_date = CURRENT_TIMESTAMP
                                WHERE id = ${problemId} AND creator_id = ${creatorUserId}
                                RETURNING *
                            )
                            INSERT INTO reviews (description, score, problem_id)
                            SELECT '${description}', ${score}, ${problemId}
                            FROM users AS U, problems AS P
                            WHERE U.id = ${creatorUserId} AND P.creator_id = U.id AND P.id = ${problemId}
                            RETURNING *;`;
    console.log(queryStatement);
    const result = await database.query(queryStatement);
    const fullReviewInfo = await selectReviewById(result.rows[0].id);
    const [review] = await generateModel([fullReviewInfo], false);
    return review
}

//TODO REDURCIR ESTO
export async function selectProblemReviews(problemId: number) {
    const queryStatement = ` SELECT R.id,
                                    R.description,
                                    R.score,
                                    R.problem_id,
                                    P.name,
                                    S.id AS creatorId,
                                    S.firstname  AS creatorName,
                                    S.username  AS creatorUsername,
                                    U.id AS solverId,
                                    U.firstname AS solverName,
                                    U.username  AS solverUsername
                            FROM reviews AS R
                            JOIN problems AS P ON R.problem_id = P.id
                            JOIN users AS U ON P.solver_id = U.id
                            JOIN users AS S ON P.creator_id = S.id
                            WHERE problem_id = ${problemId};`;
    
                            console.log(queryStatement);
    const result = await database.query(queryStatement);
    return await generateModel(result.rows, false);
}

export async function selectUserReviews(userId: number) {
    const queryStatement = ` SELECT R.id,
                                R.description,
                                R.score,
                                R.problem_id,
                                P.name,
                                S.id AS creatorId,
                                S.firstname  AS creatorName,
                                S.username  AS creatorUsername,
                                U.id AS solverId,
                                U.firstname AS solverName,
                                U.username  AS solverUsername
                            FROM reviews AS R
                            JOIN problems AS P ON R.problem_id = P.id
                            JOIN users AS U ON P.solver_id = U.id
                            JOIN users AS S ON P.creator_id = S.id
                            WHERE U.id = ${userId};`;
    
    const result = await database.query(queryStatement);
    return await generateModel(result.rows, true);
}

export async function selectUserReviewsAmount(userId: number) {
    const queryStatement = ` SELECT SUM(CASE WHEN  score = 3 THEN 1 ELSE 0 END) AS happyReviews,
                                    SUM(CASE WHEN  score = 2 THEN 1 ELSE 0 END) AS mediumReviews,
                                    SUM(CASE WHEN  score = 1 THEN 1 ELSE 0 END) AS badReviews
                            FROM reviews AS R
                            JOIN problems AS P ON R.problem_id = P.id
                            JOIN users AS U ON P.solver_id = U.id
                            WHERE U.id = ${userId};`;
    
    const result = await database.query(queryStatement);
    return result.rows[0];
}

export async function selectReviewById(reviewId: number) {
    const queryStatement = ` SELECT R.id,
                                R.description,
                                R.score,
                                R.problem_id,
                                P.name,
                                S.id AS creatorId,
                                S.firstname  AS creatorName,
                                S.username  AS creatorUsername,
                                U.id AS solverId,
                                U.firstname AS solverName,
                                U.username  AS solverUsername
                            FROM reviews AS R
                            JOIN problems AS P ON R.problem_id = P.id
                            JOIN users AS U ON P.solver_id = U.id
                            JOIN users AS S ON P.creator_id = S.id
                            WHERE R.id = ${reviewId};`;
    
    console.log(queryStatement);
    const result = await database.query(queryStatement);
    return result.rows[0];
}