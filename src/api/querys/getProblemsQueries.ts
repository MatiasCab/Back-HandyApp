import { getLocationImage } from "../helpers/getLocationImage";
import { getImageURL } from "../helpers/imagesHelper";
import { getDB } from "../services/sqlDatabase";
import { selectUserById } from "./getUsersQueries";

const database = getDB();

function statusFilter(value) {
  if(value == 'OPEN') return '';
  return ` AND P.status = '${value}'`;
}

function nameFilter(value) {
  if(value == '') return '';
  return ` AND P.name ILIKE '%${value}%'`;
}

function skillsFilter(value) {
  let statement = ` AND NOT EXISTS (
                      SELECT 1
                      FROM skills AS SK
                      WHERE SK.id IN (`;
  let pass = false;
  value.forEach(skill => {
    if(!skill.includes("'") && skill != '') {
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

  return queryFilteredStatement;
}

async function generateModel(rows: any, fullInfo: boolean,  actualUserId?: number) {
    const problems: any = [];
    for (const problem of rows) {
      const imageURL = getImageURL(problem.picture_name);
        let problemModel: any = {
          id: problem.id,
          name: problem.name,
          postedDate: problem.created_date,
          imageURL: imageURL ? imageURL : null, //TODO IMAGEN PROBLEMAS
          status: problem.status,
          resolvedDate: problem.resolved_date,
          lat: problem.lat,
          lng: problem.lng,
          distance: problem.distance,
          skills: problem.skills
        };
        if(fullInfo){
          problemModel.locationImage = await getLocationImage(problem.lat, problem.lng);
          problemModel.description = problem.description;
        }
        if(actualUserId) {
          const ownerUser = await selectUserById(problem.creator_id, actualUserId);
          problemModel.ownerUser = ownerUser;
        } else {
          problemModel.ownerUserId = problem.creator_id;
        }
        problems.push(problemModel);
      }
    return problems;
}

function locationSection(userLocation) {
  if(!userLocation) return ', NULL AS distance';
  return `, ST_Distance(
            ST_MakePoint(U.lng, U.lat) ::geography,
            ST_MakePoint(${userLocation.lng}, ${userLocation.lat}) ::geography
          ) AS distance`
}

function orderSection(order) {
  if(order == 'newest') return ' ORDER BY P.created_date DESC';
  if(order == 'lastest') return ' ORDER BY P.created_date ASC';
  if(order == 'nearby') return ' ORDER BY distance ASC NULLS LAST';
  return '';
}


//TODO ARREGLAQR LAS QUERIES PARA QUE SEA SOLA UNA.
export async function selectProblems(actualUserId: number, filters: Map<string, string>, pageInfo: { start: number, end: number }, userLocation?: {lat: number, lng: number}, order?: string) {;
    const queryStatement = ` SELECT P.id, 
                                    P.name, 
                                    P.creator_id, 
                                    P.created_date, 
                                    P.picture_name, 
                                    P.status, 
                                    P.resolved_date, 
                                    P.description, 
                                    U.lat, 
                                    U.lng, 
                                    ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                                    ${locationSection(userLocation)}
                            FROM problems AS P
                            LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            JOIN locations AS U ON U.id = P.location_id
                            LEFT JOIN friends AS F ON ((P.creator_id = F.requesting_user_id OR P.creator_id = F.receiving_user_id) AND F.accepted = TRUE)
                            WHERE P.id = P.id ${generateFiltersInProblemQuery(filters)}
                            GROUP BY P.id,
                            U.lat, U.lng
                            ${orderSection(order)}
                            OFFSET $1
                            LIMIT $2;`;
                            console.log(queryStatement);
    const result = await database.query(queryStatement, [pageInfo.start, pageInfo.end]);
    return generateModel(result.rows, false, actualUserId);
}

export async function selectProblemById(problemId: number, actualUserId: number, userLocation?: {lat: number, lng: number}) {;
    const queryStatement = ` SELECT P.id, 
                                    P.name, 
                                    P.creator_id, 
                                    P.created_date, 
                                    P.picture_name, 
                                    P.status, 
                                    P.resolved_date, 
                                    P.description, 
                                    U.lat, 
                                    U.lng, 
                                    ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                                    ${locationSection(userLocation)}
                            FROM problems AS P
                            LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                            LEFT JOIN skills AS L ON S.skill_id = L.id
                            JOIN locations AS U ON U.id = P.location_id
                            WHERE P.id = $1
                            GROUP BY P.id,
                            U.lat, U.lng;`;

    console.log(queryStatement);
    const result = await database.query(queryStatement, [problemId]);
    return await generateModel(result.rows, true, actualUserId);
}

export async function selectUserProblem(userId: number, filters: Map<string, string>, pageInfo: { start: number, end: number }, userLocation?: {lat: number, lng: number}, order?: string) {;
  const queryStatement = ` SELECT P.id, 
                                  P.name, 
                                  P.creator_id, 
                                  P.created_date, 
                                  P.picture_name, 
                                  P.status, 
                                  P.resolved_date, 
                                  P.description, 
                                  U.lat, 
                                  U.lng, 
                                  ARRAY_AGG(json_build_object('id', L.id, 'name',L.name)) AS skills
                                  ${locationSection(userLocation)}
                          FROM problems AS P
                          LEFT JOIN problems_skills AS S ON P.id = S.problem_id
                          LEFT JOIN skills AS L ON S.skill_id = L.id
                          JOIN locations AS U ON U.id = P.location_id
                          LEFT JOIN friends AS F ON ((P.creator_id = F.requesting_user_id OR P.creator_id = F.receiving_user_id) AND F.accepted = TRUE)
                          WHERE P.creator_id = $3 ${generateFiltersInProblemQuery(filters)}
                          GROUP BY P.id,
                          U.lat, U.lng
                          ${orderSection(order)}
                          OFFSET $1
                          LIMIT $2;`;
  const result = await database.query(queryStatement, [pageInfo.start, pageInfo.end, userId]);
  return await generateModel(result.rows, false);
}


