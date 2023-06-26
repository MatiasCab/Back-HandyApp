import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createLocationsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "locations" (
                            id SERIAL PRIMARY KEY,
                            lat FLOAT NOT NULL,
                            lng FLOAT NOT NULL
                        );`;
                        
    await database.query(queryStatement);
}

async function enablePostGIS() {
    const queryStatement = `CREATE EXTENSION IF NOT EXISTS postgis;`;
                        
    await database.query(queryStatement);
}

async function createUsersTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "users" (
                            id SERIAL PRIMARY KEY,
                            id_card_number INT UNIQUE NOT NULL,
                            username VARCHAR (15) UNIQUE NOT NULL,
                            firstname VARCHAR (20) NOT NULL,
                            lastname VARCHAR (20) NOT NULL,
                            birthday DATE NOT NULL,
                            referral_code INT UNIQUE NOT NULL,
                            referred_id INT,
                            location_id INT,
                            description VARCHAR(400) DEFAULT 'Bienvenido a Handy App',
                            profile_picture_name VARCHAR(30),
                            email VARCHAR (50) NOT NULL,
                            hashed_password VARCHAR (100) NOT NULL,
                            admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (referred_id) REFERENCES users (id),
                            FOREIGN KEY (location_id) REFERENCES locations (id)
                        );`;
                        
    await database.query(queryStatement);
}

async function createNonVerifiedUsersTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "non_verified_users" (
                            id SERIAL PRIMARY KEY,
                            id_card_number INT UNIQUE NOT NULL,
                            username VARCHAR (15) UNIQUE NOT NULL,
                            firstname VARCHAR (20) NOT NULL,
                            lastname VARCHAR (20) NOT NULL,
                            birthday DATE NOT NULL,
                            referral_code INT NOT NULL,
                            email VARCHAR (50) NOT NULL,
                            hashed_password VARCHAR (100) NOT NULL,
                            verify_code VARCHAR (6) NOT NULL,
                            verify_code_expiration TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
                            FOREIGN KEY (referral_code) REFERENCES users (referral_code)
                        );`;
                        
    await database.query(queryStatement)
}

async function createFriendsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "friends" (
                            requesting_user_id INT,
                            receiving_user_id INT,
                            accepted BOOLEAN DEFAULT FALSE,
                            PRIMARY KEY (requesting_user_id, receiving_user_id),
                            FOREIGN KEY (requesting_user_id) REFERENCES users (id),
                            FOREIGN KEY (receiving_user_id) REFERENCES users (id)
                        );`;
                                            
    await database.query(queryStatement);
}

async function createSkillsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "skills" (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR (30) UNIQUE NOT NULL
                        );`;
                                            
    await database.query(queryStatement);
}

async function createProblemsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "problems" (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR (30) NOT NULL,
                            description VARCHAR(400) NOT NULL,
                            status VARCHAR (15) DEFAULT 'OPEN' NOT NULL,
                            picture_name VARCHAR(30) NOT NULL,
                            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            location_id INT NOT NULL,
                            creator_id INT NOT NULL,
                            resolved_date TIMESTAMP,
                            solver_id INT,
                            FOREIGN KEY (creator_id) REFERENCES users (id),
                            FOREIGN KEY (solver_id) REFERENCES users (id),
                            FOREIGN KEY (location_id) REFERENCES locations (id)
                        );`;
                                            
    await database.query(queryStatement);
}

async function createReviewsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "reviews" (
                            id SERIAL PRIMARY KEY,
                            description VARCHAR(400) NOT NULL,
                            score INT NOT NULL CHECK (score > 0 AND score < 4),
                            problem_id INT NOT NULL,
                            FOREIGN KEY (problem_id) REFERENCES problems (id)
                        );`;
                                            
    await database.query(queryStatement);
}

async function createUsersSkillsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "users_skills" (
                            id SERIAL PRIMARY KEY,
                            user_id INT NOT NULL,
                            skill_id INT NOT NULL,
                            FOREIGN KEY (user_id) REFERENCES users (id),
                            FOREIGN KEY (skill_id) REFERENCES skills (id),
                            UNIQUE (user_id, skill_id)
                        );`;
                                            
    await database.query(queryStatement);
}

async function createProblemsSkillsTable() {
    const queryStatement = `CREATE TABLE IF NOT EXISTS "problems_skills" (
                            problem_id INT,
                            skill_id INT,
                            PRIMARY KEY (problem_id, skill_id),
                            FOREIGN KEY (problem_id) REFERENCES problems (id) ON DELETE CASCADE,
                            FOREIGN KEY (skill_id) REFERENCES skills (id)
                        );`;
                                            
    await database.query(queryStatement);
}


export async function generateBDTables(){
    await createLocationsTable();
    await createUsersTable();
    await createNonVerifiedUsersTable();
    await createFriendsTable();
    await createSkillsTable();
    await createProblemsTable();
    await createReviewsTable()
    await createUsersSkillsTable();
    await createProblemsSkillsTable();
    await enablePostGIS();
}