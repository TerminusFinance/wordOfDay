import {Connection} from "mysql2/promise";

export class AdminService {

    constructor(private db: Connection) {}

    async deleteUserById(userId: string): Promise<string> {
        const deleteUserSql = `DELETE FROM users WHERE userId = ?`;
        const deleteUserInvitationsSql = `DELETE FROM user_invitations WHERE inviter_id = ? OR invitee_id = ?`;
        const deleteUserTasksSql = `DELETE FROM userTasks WHERE userId = ?`;
        const deleteUserUserLeagueTable = `DELETE FROM users_data WHERE userId = ?`;
        const deleteUserFromAcquisitions = `DELETE FROM acquisitions WHERE userId = ?`;
        const deleteUserFromUserClans = `DELETE FROM UserPhrases WHERE userId = ?`;

        try {
            // Удаление из всех зависимых таблиц перед удалением из users
            // await this.db.execute(deleteCompletedTasksSql, [userId]);
            // await this.db.execute(deleteUserBoostsSql, [userId]);
            await this.db.execute(deleteUserInvitationsSql, [userId, userId]);
            await this.db.execute(deleteUserTasksSql, [userId]);
            await this.db.execute(deleteUserUserLeagueTable, [userId]);
            await this.db.execute(deleteUserFromAcquisitions, [userId]);
            await this.db.execute(deleteUserFromUserClans, [userId]);

            // Теперь удаляем из таблицы users
            await this.db.execute(deleteUserSql, [userId]);

            return "Success delete";
        } catch (error) {
            throw new Error(`Failed to delete user: ${error}`);
        }
    }

}