import { getDB } from "../services/sqlDatabase";

const database = getDB();

export async function selectSkills() {;
    const queryStatement = `SELECT * FROM skills;`;

    const result = await database.query(queryStatement);
    return result.rows;
}