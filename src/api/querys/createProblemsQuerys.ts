import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createUbication(lat: number, lng: number) {
    const queryStatement = `INSERT INTO locations (lat, lng)
                            SELECT ${lat}, ${lng}
                            WHERE NOT EXISTS (SELECT 1 FROM locations WHERE lat = ${lat} AND lng = ${lng});`;
    console.log(queryStatement);
    await database.query(queryStatement);
}

async function createProblemSkillsAssociations(skills: any, problemId: any) {
    for (let index = 0; index < skills.length; index++) {
        const queryStatement = `INSERT INTO problems_skills (problem_id, skill_id)
                                VALUES (${problemId}, ${skills[index]})
                                ON CONFLICT DO NOTHING;`;
        await database.query(queryStatement);
    }
}

async function deleteProblemSkillsAssociations(problemId: number) {
    const queryStatement = `DELETE FROM problems_skills AS S
                            WHERE S.problem_id = ${problemId};`;
    await database.query(queryStatement);
}

//TODO ponerlo como helper
export async function getUbicationId(lat: number, lng: number) {
    await createUbication(lat, lng);
    const queryStatement = `SELECT id 
                            FROM locations AS U
                            WHERE U.lat = ${lat} AND U.lng = ${lng};`;

    const result = await database.query(queryStatement);
    return result.rows[0][0];
}


export async function createProblem(name: string, image_url: string, description: string, userId: number, lat: number, lng: number, skills: any) {
    const ubicationId = await getUbicationId(lat, lng);
    const queryStatement = `INSERT INTO problems (name, picture_name, description, location_id, creator_id) 
                            VALUES ('${name}', '${image_url}', '${description}', '${ubicationId}', '${userId}')
                            RETURNING id;`;
    console.log(queryStatement);
    const result = await database.query(queryStatement);
    await createProblemSkillsAssociations(skills, result.rows[0][0]);
}

//TODO cambiar nombres por convencion
export async function updateProblem(name: string, image_url: string, description: string, lat: number, lng: number, skills: any, problemId: number, userId: number) {
    const ubicationId = await getUbicationId(lat, lng);
    const queryStatement = `UPDATE problems
                            SET name = '${name}',
                                picture_name = '${image_url}',
                                description = '${description}',
                                location_id = ${ubicationId}
                            WHERE id = ${problemId} AND creator_id = ${userId}
                            RETURNING id;`;
    const result = await database.query(queryStatement);
    if (result.rows.length < 1) { return; }
    await deleteProblemSkillsAssociations(problemId); //REGULAR QUE SEA SOLO SI ESTO SI SE ACTUZALIZO ALGO
    await createProblemSkillsAssociations(skills, problemId);
}

