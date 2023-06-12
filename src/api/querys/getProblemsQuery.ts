import { getDB } from "../services/sqlDatabase";
import { selectUserById, getUserFriendsAmount } from "./getUsersQuerys";

const database = getDB();
async function generateModel(rows: any, actualUserId: number) {
    const problems: any = [];
    for (const problem of rows) {
        const owner = await selectUserById(problem[2], actualUserId);
        const friendsAmount = await getUserFriendsAmount(problem[2]);
        let problemModel = {
          id: problem[0],
          name: problem[1],
          ownerId: problem[2],
          postedDate: problem[3],
          imageURL: problem[4],
          state: problem[5],
          resolvedDate: problem[6],
          description: problem[7],
          lat: problem[8],
          lng: problem[9],
          skills: problem[10],
          ubicationImage: "proximamente",
          user: {
            id: owner[0],
            name: owner[1],
            username: owner[3],
            lastname: owner[4],
            singupDate: owner[8],
            email: owner[7],
            description: owner[9],
            profileImage: "falta",
            isFriend: actualUserId != problem[2] ? owner[10] : null,
            friendsAmount: friendsAmount!.toString() 
          }
        };
        problems.push(problemModel);
      }
    return problems;
}
export async function selectProblems(actualUserId: number) {;
    const queryStatement = `SELECT P.id, P.name, P.creator_user_id, P.created_at, P.image_url, P.state, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM problems AS P
                            JOIN problem_skills AS S ON P.id = S.problem_id
                            JOIN skills AS L ON S.skill_id = L.id
                            JOIN ubications AS U ON U.id = P.ubication_id
                            GROUP BY P.id,
                            U.lat, U.lng;`;

    const result = await database.query(queryStatement);
    console.log(result.rows);
    return generateModel(result.rows, actualUserId);
}

export async function selectProblemById(problemId: number, actualUserId: number) {;
    const queryStatement = `SELECT P.id, P.name, P.creator_user_id, P.created_at, P.image_url, P.state, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM problems AS P
                            JOIN problem_skills AS S ON P.id = S.problem_id
                            JOIN skills AS L ON S.skill_id = L.id
                            JOIN ubications AS U ON U.id = P.ubication_id
                            WHERE P.id = ${problemId}
                            GROUP BY P.id,
                            U.lat, U.lng;`;

    const result = await database.query(queryStatement);
    console.log(result.rows);
    return await generateModel(result.rows, actualUserId);
}


