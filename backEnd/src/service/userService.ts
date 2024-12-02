// @ts-ignore
import mysql, {Connection} from "mysql2/promise";
import {User} from "../types/userTypes";


export class UserService {

    constructor(private db: Connection) {}

    private generateUniqueCodeToInvite(): string {
        return `UC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const getUserSql = 'SELECT * FROM users WHERE userId = ?';
        const [rows] = await this.db.execute<mysql.RowDataPacket[]>(getUserSql, [userId]);
        const user = rows[0];
        return user as User | undefined;
    }


    async createUser(userId: string, userName: string, address: string): Promise<User> {
        try {

            const existingUser = await this.getUserById(userId);
            if (existingUser) {
                throw new Error(`User with userId ${userId} already exists`);
            }

            const codeToInvite = this.generateUniqueCodeToInvite();
            const createAt = new Date().toISOString();
            const dataUpdate = createAt;

            // Создание пользователя в таблице users
            const createUserSql = `
            INSERT INTO users (userId, userName, codeToInvite, address, referral, createAt, dataUpdate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

            await this.db.execute(createUserSql, [
                userId,
                userName,
                codeToInvite,
                address || null,
                '', // assuming referral is always an empty string
                createAt,
                dataUpdate
            ]);



            const newUser = await this.getUserById(userId);
            if (!newUser) {
                throw new Error('Failed to create new user');
            }

            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }




    async processInvitation(inviteCode: string, newUserId: string, newUserName: string, isPremium: boolean): Promise<User> {


        // Проверка наличия приглашающего пользователя по коду приглашения
        const inviterSql = `SELECT * FROM users WHERE codeToInvite = ?`;
        const [inviterRows]: [any[], any] = await this.db.execute(inviterSql, [inviteCode]);
        const inviter = inviterRows[0];

        if (!inviter) {
            throw new Error('User with the given invite code not found');
        }

        // Проверка существования пользователя с данным userId
        const existingUserSql = `SELECT * FROM users WHERE userId = ?`;
        const [existingUserRows]: [any[], any] = await this.db.execute(existingUserSql, [newUserId]);


        // Создание нового пользователя
        const codeToInvite = this.generateUniqueCodeToInvite();
        const createAt = new Date().toISOString();
        const dataUpdate = createAt;

        const newUserSql = `
        INSERT INTO users (userId, userName, coins, codeToInvite, address, referral, createAt, dataUpdate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.db.execute(newUserSql, [newUserId, newUserName, 0, codeToInvite, '', inviteCode, createAt, dataUpdate]);

        const createEnergySql = `
            INSERT INTO energy (userId, currentEnergy, maxEnergy)
            VALUES (?, 1000, 1000);
        `;

        await this.db.execute(createEnergySql, [newUserId]);


            // Если это обычное приглашение пользователя, добавляем запись в user_invitations
            const insertInvitationSql = `
            INSERT INTO user_invitations (inviter_id, invitee_id)
            VALUES (?, ?, 0)
        `;
            await this.db.execute(insertInvitationSql, [inviter.userId, newUserId]);

            // const additionalCoins = isPremium ? 2500 : 500;
            // const updateInviterCoinsSql = `UPDATE users
            //                                        SET coins = coins + ?
            //                                        WHERE userId = ?`;
            // await this.db.execute(updateInviterCoinsSql, [additionalCoins, inviter.userId]);
            const updateInvitationSql = `
                        INSERT INTO user_invitations (inviter_id, invitee_id)
                        VALUES (?, ?)
                    `;
            await this.db.execute(updateInvitationSql, [inviter.userId, newUserId]);


        const user = await this.getUserById(newUserId);

        if (!user) {
            throw new Error('Failed to retrieve the new user');
        }

        return user;
    }



}