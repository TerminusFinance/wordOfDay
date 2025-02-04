import {Connection} from 'mysql2/promise';
import {PhraseService} from "./PhraseService";

export class UserPhraseService {
    private db: Connection;

    constructor(db: Connection) {
        this.db = db;
    }

    async getPhrase(userId: string, language: string): Promise<string> {
        // Получаем сегодняшнюю дату в формате 'YYYY/MM/DD'
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '/').toString(); // '2024/12/06'
        console.log("today", today);

        // Проверяем, есть ли запись с сегодняшней датой
        const [rows] = await this.db.query(
            `SELECT dateReceived, phrase FROM UserPhrases WHERE userId = ?`,
            [userId]
        );

        if (Array.isArray(rows) && rows.length > 0) {
            const { dateReceived, phrase } = rows[0] as { dateReceived: string; phrase: string | null };

            if (dateReceived === today) {
                if (phrase && phrase.trim() !== '') {
                    throw new Error('User already received a phrase today.');
                }
                // Если дата совпадает, но phrase пустая, продолжаем выдавать новую фразу
            }
        }

        // Генерируем случайную фразу
        const phrase = await this.generateRandomPhrase(language);
        console.log("phrase is -", phrase);

        // Вставляем или обновляем запись в базу данных
        await this.db.query(
            `INSERT INTO UserPhrases (userId, phrase, dateReceived, totalPhrases)
             VALUES (?, ?, ?, 1)
                 ON DUPLICATE KEY UPDATE
                                      phrase = VALUES(phrase),
                                      dateReceived = VALUES(dateReceived),
                                      totalPhrases = totalPhrases + 1`,
            [userId, phrase, today] // Передаем дату как строку в формате 'YYYY/MM/DD'
        );

        return phrase;
    }

    async getUserPhraseData(userId: string): Promise<{
        phrase: string;
        dateReceived: string;
        totalPhrases: number;
        isToday: boolean;
    }> {
        // Получаем сегодняшнюю дату в формате 'YYYY/MM/DD'
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');

        // Запрашиваем данные из базы
        const [rows] = await this.db.query(
            `SELECT phrase, dateReceived, totalPhrases FROM UserPhrases WHERE userId = ?`,
            [userId]
        );

        if (Array.isArray(rows) && rows.length > 0) {
            const { phrase, dateReceived, totalPhrases } = rows[0] as {
                phrase: string;
                dateReceived: string;
                totalPhrases: number;
            };

            // Проверяем, совпадает ли дата с сегодняшней
            const isToday = dateReceived === today;

            return { phrase, dateReceived, totalPhrases, isToday };
        } else {
            // Если записи нет, создаем новую запись
            const newPhrase = '';
            const newTotalPhrases = 0;

            await this.db.query(
                `INSERT INTO UserPhrases (userId, phrase, dateReceived, totalPhrases)
                 VALUES (?, ?, ?, ?)`,
                [userId, newPhrase, today, newTotalPhrases]
            );

            return {
                phrase: newPhrase,
                dateReceived: today,
                totalPhrases: newTotalPhrases,
                isToday: false,
            };
        }
    }

    private generateRandomPhrase  = async (item: string) : Promise<string> =>  {
        if(item == "RU") {
            const phrase = await new PhraseService().getRussianPhrases()
            console.log('eng ph - ', phrase)
            const randomIndex = Math.floor(Math.random() * phrase.length);
            return phrase[randomIndex];
        } else {
            const phrase = await new PhraseService().getEnglishPhrases()
            console.log('eng ph - ', phrase)
            const randomIndex = Math.floor(Math.random() * phrase.length);
            return phrase[randomIndex];
        }
    }
}