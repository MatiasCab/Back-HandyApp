import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createLocationsMock() {
    const queryStatement = `INSERT INTO locations (id, lat, lng)
                            VALUES (1, 0, 0)
                            ON CONFLICT DO NOTHING;`;
                        
    await database.query(queryStatement);
}

async function createUsersMock() {
    const queryStatement = `INSERT INTO users (id_card_number, username, firstname, lastname, birthday, referral_code, location_id, email, hashed_password, description, id)
                            VALUES (1234567, 'admin', 'Admin', 'AdminJr', '2002-09-30', 1, 1, 'admin@example.com', '12345678', 'Descripción de ejemplo de admin', 2),
                                    (54622357, 'Prueba 1', 'Prueba', 'PruebaJr', '2002-09-30', 2, 1, 'prueba@example.com', '12345678', 'Descripción de ejemplo de Prueba', 3)
                            
                            ON CONFLICT DO NOTHING;`;
                        
    await database.query(queryStatement);
}

async function createSkillsMock(){
    const queryStatement = `INSERT INTO skills (name)
                            VALUES ('Cocina'),
                                ('Limpieza'),
                                ('Jardinería'),
                                ('Electrodomésticos'),
                                ('Costura'),
                                ('Pintura'),
                                ('Decoración'),
                                ('Plomería'),
                                ('Carpintería'),
                                ('Estanterías'),
                                ('Grifos'),
                                ('Armarios'),
                                ('Reparaciones'),
                                ('Poda'),
                                ('Ventanas'),
                                ('Cortinas'),
                                ('Muebles'),
                                ('Cerraduras'),
                                ('Montaje'),
                                ('Mascotas')
                                ON CONFLICT DO NOTHING;`;

    await database.query(queryStatement);
}


async function createProblemsMock(){
    const queryStatement = `INSERT INTO problems (id, name, description, picture_name, location_id, creator_id, solver_id)
                            VALUES
                                (1, 'Problema 1', 'Descripción del problema 1', 'picture1.jpg', 1, 2, 3),
                                (2, 'Problema 2', 'Descripción del problema 2', 'picture2.jpg', 1, 2, NULL),
                                (3, 'Problema 3', 'Descripción del problema 3', 'picture3.jpg', 1, 2, 3),
                                (4, 'Problema 4', 'Descripción del problema 4', 'picture4.jpg', 1, 3, NULL),
                                (5, 'Problema 5', 'Descripción del problema 5', 'picture5.jpg', 1, 2, 3),
                                (6, 'Problema 6', 'Descripción del problema 6', 'picture6.jpg', 1, 3, 2),
                                (7, 'Problema 7', 'Descripción del problema 7', 'picture7.jpg', 1, 3, 2),
                                (8, 'Problema 8', 'Descripción del problema 8', 'picture8.jpg', 1, 2, 3),
                                (9, 'Problema 9', 'Descripción del problema 9', 'picture9.jpg', 1, 3, 2),
                                (10, 'Problema 10', 'Descripción del problema 10', 'picture10.jpg', 1, 2, 3)
                                ON CONFLICT DO NOTHING;`;

    await database.query(queryStatement);
    await createProblemsSkillsSociationsMock();
    await createReviewsMock();
}

async function createProblemsSkillsSociationsMock(){
    const queryStatement = `INSERT INTO problems_skills (problem_id, skill_id)
                            VALUES
                                (1, 1), (1, 2), (1, 3),
                                (2, 4), (2, 5),
                                (3, 6), (3, 7), (3, 8),
                                (4, 9),
                                (5, 10), (5, 11), (5, 12),
                                (6, 13), (6, 14),
                                (7, 15), (7, 16), (7, 17),
                                (8, 18),
                                (9, 19), (9, 20),
                                (10, 1), (10, 2), (10, 3), (10, 4), (10, 5)
                                ON CONFLICT DO NOTHING;`;

    await database.query(queryStatement);
}

async function createReviewsMock(){
    const queryStatement = `INSERT INTO reviews (id, description, score, problem_id)
                            VALUES
                                (1, 'Descripción de la reseña 1', 3, 1),
                                (2, 'Descripción de la reseña 2', 2, 3),
                                (3, 'Descripción de la reseña 3', 1, 10),
                                (4, 'Descripción de la reseña 4', 3, 8),
                                (5, 'Descripción de la reseña 5', 2, 5),
                                (6, 'Descripción de la reseña 6', 3, 6),
                                (7, 'Descripción de la reseña 7', 2, 7),
                                (8, 'Descripción de la reseña 8', 1, 9)
                                ON CONFLICT DO NOTHING;`;

    await database.query(queryStatement);
}

export async function generateMockedData(){
    await createLocationsMock();
    await createUsersMock();
    await createSkillsMock();
    await createProblemsMock();
}