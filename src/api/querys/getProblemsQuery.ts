import { getDB } from "../services/sqlDatabase";
import { selectUserById } from "./getUsersQuerys";

const database = getDB();

function statusFilter(value) {
  if(value == 'OPEN') return '';
  return ` AND P.status = '${value}'`;
}

function nameFilter(value) {
  if(value == '') return '';
  return ` AND P.name LIKE '%${value}%'`;
}

function skillsFilter(value) {
  let statement = ` AND NOT EXISTS (
                      SELECT 1
                      FROM skills AS SK
                      WHERE SK.name IN (`;
  let pass = false;
  value.forEach(skill => {
    if(!skill.includes("'")) {
      statement += `'${skill}',`;
      pass = true;
    }
  });
  if(!pass) return '';
  statement = statement.slice(0, -1)
  return statement +  `) AND NOT EXISTS (
                          SELECT 1
                          FROM problems_skills AS PS
                          WHERE PS.problem_id = P.id
                          AND PS.skill_id = SK.id
                        )
                      )`;
}

function friendsFilter(value, actualUserId) {
  if(value != 'friends') return '';
  return ` AND (${actualUserId} = F.requesting_user_id OR ${actualUserId} = F.receiving_user_id)`;
}

function generateFiltersInProblemQuery(filters: Map<string, string>) {
  let queryFilteredStatement = '';
  queryFilteredStatement += statusFilter(filters.get('status'));
  queryFilteredStatement += nameFilter(filters.get('name'));
  queryFilteredStatement += skillsFilter(filters.get('skills'));
  queryFilteredStatement += friendsFilter(filters.get('creator'), filters.get('actualUserId')!); //TODO filtro de amigos.

  console.log(queryFilteredStatement);
  return queryFilteredStatement;
}

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
export async function selectProblems(actualUserId: number, filters: Map<string, string>) {;
    const queryStatement = `SELECT P.id, P.name, P.creator_id, P.created_date, P.picture_name, P.status, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                            FROM problems AS P
                            LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            JOIN locations AS U ON U.id = P.location_id
                            LEFT JOIN friends AS F ON ((P.creator_id = F.requesting_user_id OR P.creator_id = F.receiving_user_id) AND F.accepted = TRUE)
                            WHERE P.id = P.id ${generateFiltersInProblemQuery(filters)}
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

export async function selectUserProblem(userId: number, filters: Map<string, string>) {;
  const queryStatement = `SELECT P.id, P.name, P.creator_id, P.created_date, P.picture_name, P.status, P.resolved_date, P.description, U.lat, U.lng, ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                          FROM problems AS P
                          LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                          LEFT JOIN skills AS L ON S.skill_id = L.id
                          JOIN locations AS U ON U.id = P.location_id
                          LEFT JOIN friends AS F ON ((P.creator_id = F.requesting_user_id OR P.creator_id = F.receiving_user_id) AND F.accepted = TRUE)
                          WHERE P.creator_id = ${userId} ${generateFiltersInProblemQuery(filters)}
                          GROUP BY P.id,
                          U.lat, U.lng;`;

  console.log(queryStatement);
  const result = await database.query(queryStatement);
  return await generateModel(result.rows);
}


