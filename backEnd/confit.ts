import * as dotenv from 'dotenv';
// @ts-ignore
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './param.env') });

export const botToken = process.env.MY_SECRET_TOKEN || "";
export const userForDB = process.env.user || "";
export const passwordForDB = process.env.password || "";
export const databaseName = process.env.database || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

if (!botToken) {
    console.error('MY_SECRET_TOKEN is not defined in .env file');
}

if (!userForDB) {
    console.error('user is not defined in .env file');
}


if (!passwordForDB) {
    console.error('passwordForDB is not defined in .env file');
}

if (!databaseName) {
    console.error('databaseName is not defined in .env file');
}