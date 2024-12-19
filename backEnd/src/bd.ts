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
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
};


export async function connectDatabase() {
    try {
        const connection = await mysql.createConnection(MYSQL_CONFIG);
        console.log('Connected to MySQL database');
        await createTables(connection)
        await modifyColumn(connection)
        // await addedItemToColum(connection)
        return connection;
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        throw error;
    }
}

async function createTables(db: Connection) {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
                                             userId VARCHAR(255) PRIMARY KEY,
            userName VARCHAR(255),
            coins INT DEFAULT 0,
            codeToInvite VARCHAR(255),
            address VARCHAR(255),
            referral VARCHAR(255),
            createAt VARCHAR(255),
            dataUpdate VARCHAR(255),
            imageAvatar VARCHAR(255) DEFAULT NULL,
            enabledAirDrop INT DEFAULT 0
            );
    `;

    const userData = `
        CREATE TABLE IF NOT EXISTS users_data (
                                                  userId VARCHAR(255),
            dayBirth VARCHAR(255),
            lovedAnimal VARCHAR(255),
            lovedColor VARCHAR(255),
            PRIMARY KEY (userId),
            FOREIGN KEY (userId) REFERENCES users(userId)
            );
    `;

    const userPhraseTable = `
        CREATE TABLE IF NOT EXISTS UserPhrases (
                                     userId VARCHAR(255) PRIMARY KEY,
                                     phrase VARCHAR(255) NOT NULL,
                                        dateReceived VARCHAR(255) NOT NULL,
                                     totalPhrases INT DEFAULT 0,
                                     FOREIGN KEY (userId) REFERENCES users(userId)
        );
    `;

    const createUserInvitationsTable = `
        CREATE TABLE IF NOT EXISTS user_invitations (
                                                        inviter_id VARCHAR(255),
            invitee_id VARCHAR(255),
            coinsReferral INT DEFAULT 0,
            PRIMARY KEY (inviter_id, invitee_id),
            FOREIGN KEY (inviter_id) REFERENCES users(userId),
            FOREIGN KEY (invitee_id) REFERENCES users(userId)
            );
    `;

    const createTasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             text VARCHAR(255),
            coins INT DEFAULT 0,
            checkIcon VARCHAR(255),
            taskType VARCHAR(255),
            type VARCHAR(255),
            actionBtnTx VARCHAR(255) DEFAULT NULL,
            txDescription VARCHAR(255) DEFAULT NULL,
            sortLocal VARCHAR(255) DEFAULT NULL,
            rewards VARCHAR(255) DEFAULT NULL,
            completeLimit INT DEFAULT NULL,
            completeCount INT DEFAULT 0,
            isVisible INT DEFAULT 0
            );
    `;

    const createUserTasksTable = `
        CREATE TABLE IF NOT EXISTS userTasks (
                                                 userId VARCHAR(255),
            taskId INT,
            completed BOOLEAN DEFAULT 0,
            lastCompletedDate VARCHAR(255) DEFAULT NULL,
            dataSendCheck VARCHAR(255) DEFAULT NULL,
            isLoading BOOLEAN DEFAULT 0,
            etTx VARCHAR(255) DEFAULT NULL,
            etaps INT DEFAULT 0,
            storedValues VARCHAR(255) DEFAULT NULL,
            PRIMARY KEY (userId, taskId),
            FOREIGN KEY (userId) REFERENCES users(userId),
            FOREIGN KEY (taskId) REFERENCES tasks(id)
            );
    `;

    const createAcquisitionsTableQuery = `
        CREATE TABLE IF NOT EXISTS acquisitions (
                                                    userId VARCHAR(255),
            totalAmount DECIMAL(10, 2) DEFAULT 0,
            lastPurchase VARCHAR(255) DEFAULT NULL,
            selectedPurchase VARCHAR(255) DEFAULT NULL,
            selectedAmount DECIMAL(10, 2) DEFAULT 0,
            PRIMARY KEY (userId),
            FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
            );
    `;

    const createPremiumTable = `
        CREATE TABLE IF NOT EXISTS premium (
                                               userId VARCHAR(255),
            amountSpent INT DEFAULT 0,
            endDateOfWork VARCHAR(255) DEFAULT NULL,
            PRIMARY KEY (userId),
            FOREIGN KEY (userId) REFERENCES users(userId)
            );
    `;

    await db.execute(createUsersTable);
    await db.execute(userData);
    await db.execute(createUserInvitationsTable);
    await db.execute(createTasksTable);
    await db.execute(createUserTasksTable);
    await db.execute(createAcquisitionsTableQuery);
    await db.execute(createPremiumTable);
    await db.execute(userPhraseTable);
}

async function modifyColumn(db: Connection): Promise<void> {
    const modifyColumnSql = `
        ALTER TABLE UserPhrases
            MODIFY COLUMN dateReceived VARCHAR(255) NOT NULL;
    `;

    try {
        await db.execute(modifyColumnSql);
        console.log("Column 'dateReceived' modified to VARCHAR(255) successfully.");
    } catch (error) {
        console.error("Error modifying 'dateReceived' column:", error);
    }
}

async function addedItemToColum(db: Connection) {
    const addedToCustomTable = `
        ALTER TABLE users ADD COLUMN coins INT DEFAULT 0
`

    try {
        await db.execute(addedToCustomTable);
        console.log("Column 'addedToCustomTable' modified to VARCHAR(255) successfully.");
    } catch (e) {
        console.error("Error modifying 'dateReceived' column:", e);
    }
}