import TelegramBot from 'node-telegram-bot-api';
import { botToken } from '../../confit';
import {connectDatabase} from "../bd";
import AcquisitionsService from "../service/AcquisitionsService";
export const myBot = new TelegramBot(botToken, { polling: true });


export const sendMessage = async (chatId: number, responseText: string, lnCode: string, inviteCode?: string) => {
    try {
        await myBot.sendMessage(chatId, responseText, {
            parse_mode: 'Markdown',
            reply_markup: getInlineMarkup(lnCode, inviteCode)
        });
    } catch (e) {
        console.error('Произошла ошибка:', e);
    }
};

const getInlineMarkup = (lnCode: string, inviteCode?: string) => {
    const playButton = {
        text: lnCode === 'ru' ? 'Играть сейчас 💰' : 'Play right now 💰',
        web_app: { url: `https://shuriginadiana.net?inviteCode=${inviteCode || ''}` }
    };

    const subscribeButton = {
        text: lnCode === 'ru' ? 'Подписаться на канал 🔞' : 'Subscribe to chanel 🔞',
        url: 'https://t.me/TerminusFinance'
    };

    const howToPlayButton = {
        text: lnCode === 'ru' ? 'Как играть 🫦' : 'How to Play 🫦',
        callback_data: lnCode === 'ru' ? 'how_to_play-ru' : 'how_to_play-en'
    };

    return {
        inline_keyboard: [
            [playButton],
            [subscribeButton],
            [howToPlayButton]
        ]
    };
};

export const sendInstructions = async (chatId: number, lnCode: string) => {
    const responseText = lnCode === 'ru' ? ' Как играть в Word Stream:\n' +
        '\n' +
        '▪️ Заходи каждый день получай мотивирующую фразу и действуй!\n' +
        '\n' +
        '▪️ Выполняй задания — подписывайся на соцсети и получай награды за активность.\n' +

        '▪️ Приглашай друзей — зови друзей в желанный мир соблазнов и получай награды.\n' +
        '\n' +
        '💰 Листинг токенов — в конце сезона выпустим токен и распределим среди игроков. Дата появится на канале.' : 'How to play Word Stream:\\n\' +\n' +
        '        \'\\n\' +\n' +
        '        Come in every day, get a motivational phrase and act!\\n\' +\n' +
        '        \'\\n\' +\n' +
        '        Complete tasks — subscribe to social networks and receive rewards for activity.\\n\' +\n' +
        '      \n' +
        '        Invite your friends — invite your friends to the coveted world of temptations and get rewards.\\n\' +\n' +
        '        \'\\n\' +\n' +
        '        Token listing — at the end of the season we will issue a token and distribute it among the players. The date will appear on the channel.\'';
    await sendMessage(chatId, responseText, lnCode);
};



myBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const code = msg.from?.language_code;

    if (msg.successful_payment) {
        await handleSuccessfulPayment(msg.successful_payment);
    } else {
        if (msg.text?.startsWith('/start')) {
            if (code) {
                await sendMessage(chatId, code === 'ru' ? 'Добро пожаловать в Word Stream \n' +
                    '\n' +
                    'Получай мотивирующее слово дня, приглашай друзей и зарабатывай токены \n' +
                    '\n' +
                    '🔥 Жми на кнопку ниже' : 'Welcome to Word Stream\n' +
                    '\n' +
                    'Get the motivating word of the day, invite friends and earn tokens \n' +
                    '\n' +
                    '🔥 Click on the button below', code);
            }
        } else if (msg.text?.startsWith('/howtoplay')) {
            if (code) {
                await sendInstructions(chatId, code);
            }
        } else {
            if (code) {
                await sendMessage(chatId, code === 'ru' ? 'Ошибка' : 'Error', code);
            }
        }
    }
})

myBot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    if (!message) return;

    const chatId = message.chat.id;
    const data = callbackQuery.data;

    if (data === 'how_to_play-ru') {
        await sendInstructions(chatId, 'ru');
    } else if (data === 'how_to_play-en') {
        await sendInstructions(chatId, 'en');
    }

    await myBot.answerCallbackQuery(callbackQuery.id);
});

myBot.on('pre_checkout_query', async (preCheckoutQuery) => {
    try {
        // Здесь добавляем обязательные аргументы: pre_checkout_query_id и ok (true)
        await myBot.answerPreCheckoutQuery(preCheckoutQuery.id, true);
        console.log('Pre-checkout query answered successfully');
    } catch (error) {
        console.error('Failed to answer pre-checkout query:', error);
    }
});


myBot.on('chat_join_request', async (chatJoinRequest) => {
    const chatId = chatJoinRequest.chat.id;
    const userId = chatJoinRequest.from?.id;

    try {
        if (userId) {
            await myBot.approveChatJoinRequest(chatId, userId);
            await sendMessage(userId, 'Добро пожаловать в наш закрытый канал!', 'ru');
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(`Failed to approve join request: ${e.message}`);
        } else {
            console.error(`Failed to approve join request: ${e}`);
        }
    }
});


const handleSuccessfulPayment = async (successfulPayment: any) => {
    // Извлекаем userId из платежа
    const userId = successfulPayment.telegram_payment_charge_id.split('_')[0]; // Пример разбора ID
    console.log(`User with ID ${userId} has made a successful payment`);
    console.log(`Payment details: ${JSON.stringify(successfulPayment)}`);

    // Подключение к базе данных
    const dbConnection = await connectDatabase()

    try {
        // Создаем экземпляр контроллера с подключением к базе данных
        const acquisitionsController = new AcquisitionsService(dbConnection);

        // Передаем данные для обработки
        const result = await acquisitionsController.subscriptionProcessing(
            successfulPayment.provider_payment_charge_id,
            successfulPayment.total_amount
        );

        // Проверяем результат обработки
        if (result === true) {
            console.log('Payment processed successfully');
        } else {
            console.log(`Payment processing error: ${result}`);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
    } finally {
        // Закрываем соединение с базой данных
        await dbConnection.end();
    }
};


export default myBot;