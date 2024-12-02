import {databaseName, passwordForDB, userForDB} from "../confit";
import {Connection} from "mysql2/promise";
// @ts-ignore
import mysql from 'mysql2/promise';

const MYSQL_CONFIG = {
    host: 'localhost',
    user: userForDB,
    password: passwordForDB,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,   // Максимальное количество соединений в пуле
    queueLimit: 0,
    // Тайм-ауты для стабильности
    connectTimeout: 10000,  // Тайм-аут на подключение (10 секунд)
    acquireTimeout: 30000,  // Тайм-аут на получение соединения (30 секунд)
    timeout: 0              // Отключаем автоматическое завершение соединения
};


export async function connectDatabase() {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('Connected to MySQL database');


    await createTables(connection);

    return connection;
}


async function createTables(db: Connection) {

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users(
            userId VARCHAR (255) PRIMARY KEY,
            userName VARCHAR (255),
            codeToInvite VARCHAR (255),
            address VARCHAR (255),
            referral VARCHAR (255),
            createAt VARCHAR (255),
            dataUpdate VARCHAR(255),
            imageAvatar VARCHAR(255) DEFAULT NULL,
            enabledAirDrop INT DEFAULT 0,
            );
    `;


    const userData = `
        CREATE TABLE IF NOT EXITS users_data(
            userId VARCHAR(255),
            dayBirdh VARCHAR(255),
            lovedAnimal VARCHAR(255),
            lovedColor VARCHAR(255),
            FOREIGN KEY (userId) REFERENCES users(userId),
            PRIMARY KEY(userId)
        )
    `

    await db.execute(createUsersTable)
    await db.execute(userData)

}