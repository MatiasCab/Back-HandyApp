import mysql2 from 'mysql2/promise';
import dotenv from "dotenv";

dotenv.config();

const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10
});

db.on('connection', function (connection) {
    console.log('DB Connection established');

    connection.on('error', function (err) {
        console.error(new Date(), 'DB error', err.code);
    });
    connection.on('close', function (err) {
        console.error(new Date(), 'DB close', err);
    });

});

export function getDB() {
    return db;
};
