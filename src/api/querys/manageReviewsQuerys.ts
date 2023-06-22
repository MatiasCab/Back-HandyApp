import { getDB } from "../services/sqlDatabase";
import { getUserIdByUsername} from "./getUsersQuerys";

const database = getDB();


//TODO SEPARARLO PARA QUE ESTE MAS LINOD.
async function generateModel(rows: any, withFullInfo) {
    const reviews: any = [];
    for (const review of rows) {
        console.log(review);
        let reviewModel: any = {
            id: review[0],
            description: review[1],
            score: review[2],
            problemId: review[3],
            problemName: review[4],
            creator: {
                id: review[5],
                firstname: review[6],
                creatorUsername: review[7]
            }
        };
        if(!withFullInfo){
            reviewModel.reviewedUser = {
                id: review[8],
                firstname: review[9],
                creatorUsername: review[10]
            }
        }
        reviews.push(reviewModel);
    }
    let reviewsInfo = reviews;
    if (withFullInfo) {
        const reviewsAmount = await selectUserReviewsAmount(rows[0][8]);
        reviewsInfo = {
            good: reviewsAmount[0]!.toString(),
            mid: reviewsAmount[1]!.toString(),
            bad: reviewsAmount[2]!.toString(),
            reviewedUser: {
                id: rows[0][8],
                firstname: rows[0][9],
                creatorUsername: rows[0][10]
            },
            reviews: reviews
        }
    }
    return reviewsInfo;
}

export async function insertReview(description: string, score: number, problemId: number, creatorUserId: number, solverUserName: string) {
    const [reviewedUserId] = await getUserIdByUsername(solverUserName);
    const queryStatement = `WITH updated_problem AS (
                                UPDATE problems
                                SET status = 'CLOSED',
                                    solver_id =  ${reviewedUserId},
                                    resolved_date = CURRENT_TIMESTAMP
                                WHERE id = ${problemId} AND creator_id = ${creatorUserId}
                                RETURNING *
                            )
                            INSERT INTO reviews (description, score, problem_id)
                            SELECT '${description}', ${score}, ${problemId}
                            FROM users AS U, problems AS P
                            WHERE U.id = ${creatorUserId} AND P.creator_id = U.id AND P.id = ${problemId}
                            RETURNING *;`;
    const result = await database.query(queryStatement);
    const [review] = await generateModel(result.rows, true);
    return review
}

//TODO REDURCIR ESTO
export async function selectProblemReviews(problemId: number) {
    const queryStatement = ` SELECT R.id,
                                    R.description,
                                    R.score,
                                    R.problem_id,
                                    P.name,
                                    S.id,
                                    S.firstname,
                                    S.username,
                                    U.id,
                                    U.firstname,
                                    U.username
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
                                    S.id,
                                    S.firstname,
                                    S.username,
                                    U.id,
                                    U.firstname,
                                    U.username
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
