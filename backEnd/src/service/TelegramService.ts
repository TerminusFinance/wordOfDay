import { Connection } from 'mysql2/promise';
import myBot from "../bot/Bot";
interface UserRow {
    userId: number;
    codeToInvite: string;
}
class TelegramService {
    private bot = myBot;
    constructor(private db: Connection) {}

    // Метод для отправки сообщения одному пользователю

    getInlineMarkup = (lnCode: string, inviteMessage: string, inviteCode?: string, ) => {
        const playButton = {
            text: lnCode === 'ru' ? 'Играть сейчас 💰' : 'Play right now 💰',
            web_app: { url: `https://husiev.com?inviteCode=${inviteCode || ''}` }
        };

        const subscribeButton = {
            text: lnCode === 'ru' ? 'Подписаться на канал 🔞' : 'Subscribe to chanel 🔞',
            url: 'https://t.me/TerminusFinance'
        };

        const howToPlayButton = {
            text: lnCode === 'ru' ? 'Пригласи друга! 🫦' : 'Send invite to friends 🫦',
            url: `tg://msg_url?url=${encodeURIComponent(inviteMessage)}`
        };

        return {
            inline_keyboard: [
                [playButton],
                [subscribeButton],
                [howToPlayButton]
            ]
        };
    };

    // Метод для рассылки сообщения всем пользователям
    async broadcastMessage(message: string, image: string): Promise<void> {
        try {
            const [rows] = await this.db.execute(`SELECT userId, codeToInvite FROM users`);
            const userIds: UserRow[] = rows as UserRow[];

            for (const chatId of userIds) {
                try {
                    const shareMessage = `t.me/WordStreamBot/app?startapp=${chatId.codeToInvite}
` +
                        "\n" +
                        "Generates a phrase and connects air drop 💸 right now!🔥\n"


                    await this.bot.sendPhoto(chatId.userId, image, {
                        caption: message,
                        parse_mode: 'Markdown',
                        reply_markup: this.getInlineMarkup("ru", shareMessage, chatId.codeToInvite)
                    });
                    console.log(`Message sent to ${chatId.userId}`);
                } catch (error) {
                    console.error(`Error sending to ${chatId.userId}:`, error);
                    continue; // Пропускаем ошибку и идем к следующему пользователю
                }
                await new Promise(resolve => setTimeout(resolve, 100)); // 100 мс задержка
            }

            console.log('Рассылка завершена.');
        } catch (error) {
            console.error('Ошибка при рассылке сообщений:', error);
        }
    }

}

export default TelegramService;