import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createUbication(lat: number, lng: number) {
    const queryStatement = `INSERT INTO ubications (lat, lng)
                            SELECT ${lat}, ${lng}
                            WHERE NOT EXISTS (SELECT 1 FROM ubications WHERE lat = ${lat} AND lng = ${lng});`;
    await database.query(queryStatement);
}

async function createProblemSkillsAssociations(skills: any, problemId: any) {
    for (let index = 0; index < skills.length; index++) {
        const queryStatement = `INSERT INTO problem_skills (problem_id, skill_id)
                                VALUES (${problemId}, ${skills[index]})
                                ON CONFLICT DO NOTHING;`;
        await database.query(queryStatement);
    }
}

async function deleteProblemSkillsAssociations(problemId: number) {
    const queryStatement = `DELETE FROM problem_skills AS S
                            WHERE S.problem_id = ${problemId};`;
    await database.query(queryStatement);
}

async function getUbicationId(lat: number, lng: number) {
    await createUbication(lat, lng);
    const queryStatement = `SELECT id 
                            FROM ubications AS U
                            WHERE U.lat = ${lat} AND U.lng = ${lng};`;

    const result = await database.query(queryStatement);
    return result.rows[0][0];
}


export async function createProblem(name: string, image_url: string, description: string, userId: number, lat: number, lng: number, skills: any) {
    const ubicationId = await getUbicationId(lat, lng);
    const queryStatement = `INSERT INTO problems (name, image_url, description, ubication_id, creator_user_id) 
                            VALUES ('${name}', '${image_url}', '${description}', '${ubicationId}', '${userId}')
                            RETURNING id;`;
    const result = await database.query(queryStatement);
    await createProblemSkillsAssociations(skills, result.rows[0][0]);
}

export async function updateProblem(name: string, image_url: string, description: string, lat: number, lng: number, skills: any, problemId: number, userId: number) {
    const ubicationId = await getUbicationId(lat, lng);
    const queryStatement = `UPDATE problems
                            SET name = '${name}',
                                image_url = '${image_url}',
                                description = '${description}',
                                ubication_id = ${ubicationId}
                            WHERE id = ${problemId} AND creator_user_id = ${userId}
                            RETURNING id;`;
    const result = await database.query(queryStatement);
    if (result.rows.length < 1) { return; }
    await deleteProblemSkillsAssociations(problemId); //REGULAR QUE SEA SOLO SI ESTO SI SE ACTUZALIZO ALGO
    await createProblemSkillsAssociations(skills, problemId);
}

