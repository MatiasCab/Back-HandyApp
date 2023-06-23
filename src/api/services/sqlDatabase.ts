
import { Client } from 'ts-postgres';
import dotenv from "dotenv";

dotenv.config();



const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    //connectionLimit: 10
});

client.connect();


export function getDB() {
    return client;
};
