import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createUbication(lat: number, lng: number) {
    const queryStatement = `INSERT INTO locations (lat, lng)
                            SELECT $1, $2
                            WHERE NOT EXISTS (SELECT 1 FROM locations WHERE lat = $1 AND lng = $2);`;
    const values = [lat, lng];
    console.log(queryStatement, values);
    await database.query(queryStatement, values);
}

async function createProblemSkillsAssociations(skills: any, problemId: any) {
    for (let index = 0; index < skills.length; index++) {
        const queryStatement = `INSERT INTO problems_skills (problem_id, skill_id)
                                VALUES ($1, $2)
                                ON CONFLICT DO NOTHING;`;
        const values = [problemId, skills[index]];
        await database.query(queryStatement, values);
    }
}

async function deleteProblemSkillsAssociations(problemId: number) {
    const queryStatement = `DELETE FROM problems_skills AS S
                            WHERE S.problem_id = $1;`;
    await database.query(queryStatement, [problemId]);
}

//TODO ponerlo como helper
export async function getUbicationId(lat: number, lng: number) {
    await createUbication(lat, lng);
    const queryStatement = `SELECT id 
                            FROM locations AS U
                            WHERE U.lat = $1 AND U.lng = $2;`;
    
    const values = [lat, lng];
    const result = await database.query(queryStatement, values);
    console.log(result);
    return result.rows[0].id;
}


export async function createProblem(name: string, imageName: string, description: string, userId: number, lat: number, lng: number, skills: any) {
    const ubicationId = await getUbicationId(lat, lng);
    const queryStatement = `INSERT INTO problems (name, picture_name, description, location_id, creator_id) 
                            VALUES ($1, $2, $3, $4, $5)
                            RETURNING id;`;
    
    const values = [name, imageName, description, ubicationId, userId];
    console.log(queryStatement);
    const result = await database.query(queryStatement, values);
    await createProblemSkillsAssociations(skills, result.rows[0].id);
}

//TODO fijarse si funciona con el tema de la imagen
export async function updateProblem(name: string, description: string, lat: number, lng: number, skills: any, problemId: number, userId: number,  imageName?: string) {
    const ubicationId = await getUbicationId(lat, lng);
    const updatedImageName = imageName ? imageName : 'picture_name';
    const queryStatement = `UPDATE problems
                            SET name = $1,
                                picture_name = $2,
                                description = $3,
                                location_id = $4
                            WHERE id = $5 AND creator_id = $6
                            RETURNING id;`;
    const values = [name, updatedImageName, description, ubicationId, problemId, userId];
    const result = await database.query(queryStatement, values);
    if (result.rows.length < 1) { return false; }
    await deleteProblemSkillsAssociations(problemId); //REGULAR QUE SEA SOLO SI ESTO SI SE ACTUZALIZO ALGO
    await createProblemSkillsAssociations(skills, problemId);
    return true;
}

