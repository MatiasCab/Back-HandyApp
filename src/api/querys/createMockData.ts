import { getDB } from "../services/sqlDatabase";

const database = getDB();

async function createLocationsMock() {
    const queryStatement = `INSERT INTO locations (id, lat, lng)
                            VALUES (1, 0, 0)
                            ON CONFLICT DO NOTHING;`;
                        
    await database.query(queryStatement);
}

async function createUsersMock() {
    const queryStatement = `INSERT INTO users (id_card_number, username, firstname, lastname, birthday, referral_code, location_id, email, hashed_password, description)
                            VALUES (1234567, 'admin', 'Admin', 'AdminJr', '2002-09-30', 1, 1, 'admin@example.com', '12345678', 'Descripción de ejemplo de admin')
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


export async function generateMockedData(){
    await createLocationsMock();
    await createUsersMock();
    await createSkillsMock();
}