import { getDB } from "../services/sqlDatabase";
import { selectUserById } from "./getUsersQuerys";

const database = getDB();
async function generateModel(rows: any, actualUserId?: number) {
    const problems: any = [];
    for (const problem of rows) {
        let problemModel: any = {
          id: problem[0],
          name: problem[1],
          postedDate: problem[3],
          imageURL: problem[4],
          status: problem[5],
          resolvedDate: problem[6],
          description: problem[7],
          lat: problem[8],
          lng: problem[9],
          ubicationImage: "proximamente",
          skills: problem[10]
        };
        if(actualUserId) {
          const ownerUser = await selectUserById(problem[2], actualUserId);
          problemModel.ownerUser = ownerUser;
        } else {
          problemModel.ownerUserId = problem[2];
        }
        problems.push(problemModel);
      }
    return problems;
}
export async function selectProblems(actualUserId: number) {;
    const queryStatement = `SELECT P.id, P.name, P.creator_id, P.created_date, P.picture_name, P.status, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM problems AS P
                            LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            JOIN locations AS U ON U.id = P.location_id
                            GROUP BY P.id,
                            U.lat, U.lng;`;

    const result = await database.query(queryStatement);
    return generateModel(result.rows, actualUserId);
}

export async function selectProblemById(problemId: number, actualUserId: number) {;
    const queryStatement = `SELECT P.id, P.name, P.creator_id, P.created_date, P.picture_name, P.status, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM problems AS P
                            LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            JOIN locations AS U ON U.id = P.location_id
                            WHERE P.id = ${problemId}
                            GROUP BY P.id,
                            U.lat, U.lng;`;

    const result = await database.query(queryStatement);
    return await generateModel(result.rows, actualUserId);
}

export async function selectUserProblem(userId: number) {;
  const queryStatement = `SELECT P.id, P.name, P.creator_id, P.created_date, P.picture_name, P.status, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                          FROM problems AS P
                          LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                          LEFT JOIN skills AS L ON S.skill_id = L.id
                          JOIN locations AS U ON U.id = P.location_id
                          WHERE P.creator_id = ${userId}
                          GROUP BY P.id,
                          U.lat, U.lng;`;

  const result = await database.query(queryStatement);
  return await generateModel(result.rows);
}


