import { Pool } from 'pg';
import dotenv from "dotenv";

dotenv.config();



const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 5432
    //connectionLimit: 10
});

client.connect();


export function getDB() {
    return client;
};
