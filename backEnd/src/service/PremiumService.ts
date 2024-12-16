import {Connection} from 'mysql2/promise';
import AcquisitionsService from "./AcquisitionsService";

/**
 *  types
 */
interface LabeledPrice {
    label: string;
    amount: number;
}

export interface SubscriptionOptions {
    name: string;
    description: string;
    price: number;
    image: string;
}

export interface PremiumItem {
    amountSpent: number;
    endDateOfWork?: string | null;
}

class PremiumService {
    constructor(private db: Connection) {
    }

    async getListSubscriptionOptions(): Promise<SubscriptionOptions[]> {
        const prices: SubscriptionOptions[] = [
            {
                name: '6 hour',
                description: "Collect an offline bonus for the next 6 hours. Single-use only.",
                price: 20,
                image: "/api/img/1727460000111-992830697.png"
            },
            {
                name: '12 hour',
                description: "Collect an offline bonus for the next 12 hours. Single-use only.",
                price: 35,
                image: "/api/img/1727460026985-912442190.png"
            },
            {
                name: '24 hour',
                description: "Collect an offline bonus for the next 24 hours. Single-use only.",
                price: 70,
                image: "/api/img/1727460039715-280554570.png"
            },
            {
                name: '48 hour',
                description: "Collect an offline bonus for the next 48 hours. Single-use only.",
                price: 140,
                image: "/api/img/1727460048802-158854309.png"
            },
        ];

        return prices;
    }

    async buyPremium(chat_id: string, selectedSubscriptionOptions: SubscriptionOptions) {
        let resultAmount: number;


        // if (![20, 40, 80, 160].includes(selectedSubscriptionOptions.price)) {
        //     throw new Error('This service does not exist');
        // }


        resultAmount = selectedSubscriptionOptions.price;


        const currentLabeledPrice: LabeledPrice[] = [{
            label: `prem_${selectedSubscriptionOptions.name}`,
            amount: resultAmount
        }];

        const title = `Premium to ${selectedSubscriptionOptions.name}`;
        const description = 'The premium to fat tap app';
        const currency = 'XTR';
        const payload = 'Payload info';

        const acquisitionsController = new AcquisitionsService(this.db)
        const resultPayment = await acquisitionsController.sendPayment(chat_id, title, description, payload, currency, currentLabeledPrice, `prem_${selectedSubscriptionOptions.name}`);
        console.log('resultPayment - ', resultPayment);
        return resultPayment;
    }

    async buyOneTimePremium(chat_id: string) {
        let resultAmount= 500;


        const currentLabeledPrice: LabeledPrice[] = [{
            label: `prem_one_time`,
            amount: resultAmount
        }];

        const title = `Premium to one time`;
        const description = 'The premium to fap tap app';
        const currency = 'XTR';
        const payload = 'Payload info';

        const acquisitionsController = new AcquisitionsService(this.db)
        const resultPayment = await acquisitionsController.sendPayment(chat_id, title, description, payload, currency, currentLabeledPrice, `prem_one_time`);
        console.log('resultPayment - ', resultPayment);
        return resultPayment;
    }


    async updateSubscription(userId: string, amountSpent: number, idBuying: "prem_6 hour" | "prem_12 hour" |"prem_24 hour" | "prem_48 hour"): Promise<void> {
        const currentDate = new Date();

        // Получение текущей даты окончания подписки
        const selectEndDateSql = 'SELECT endDateOfWork FROM premium WHERE userId = ?';
        const [existingSubscriptionRows] = await this.db.execute(selectEndDateSql, [userId]);
        const existingSubscription = (existingSubscriptionRows as any[])[0];

        let baseDate: Date;

        // Если подписка уже существует, используем дату окончания подписки или текущую дату
        if (existingSubscription && existingSubscription.endDateOfWork) {
            const existingEndDate = new Date(existingSubscription.endDateOfWork);
            baseDate = existingEndDate > currentDate ? existingEndDate : currentDate;
        } else {
            baseDate = currentDate;
        }

        // Количество часов в зависимости от idBuying
        let hoursToAdd: number;
        switch (idBuying) {
            case "prem_6 hour":
                hoursToAdd = 6;
                break;
            case "prem_12 hour":
                hoursToAdd = 12;
                break;
            case "prem_24 hour":
                hoursToAdd = 24;
                break;
            case "prem_48 hour":
                hoursToAdd = 48;
                break;
            default:
                throw new Error("Invalid idBuying value");
        }

        // Добавляем часы к baseDate
        const endDate = new Date(baseDate);
        endDate.setTime(endDate.getTime() + (hoursToAdd * 60 * 60 * 1000)); // Добавляем часы в миллисекундах
        const endDateOfWork = endDate.toISOString().replace('T', ' ').split('.')[0]; // Преобразуем дату в нужный формат

        // Обновляем запись в таблице
        const updateSubscriptionSql = `
        INSERT INTO premium (userId, amountSpent, endDateOfWork)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            amountSpent = amountSpent + VALUES(amountSpent),
            endDateOfWork = VALUES(endDateOfWork)
    `;
        await this.db.execute(updateSubscriptionSql, [userId, amountSpent, endDateOfWork]);

        console.error('Update Successful');
    }



    async updateSubscriptionOneTimePremium(userId: string, amountSpent: number, idBuying: "prem_one_time"): Promise<void> {

        // Обновляем запись в таблице
        // Обновляем поле oneTimePremium в таблице users
        const updateUserSql = `
            UPDATE users
            SET oneTimePremium = 1
            WHERE userId = ?
        `;
        await this.db.execute(updateUserSql, [userId]);

        console.error('Update Successful');
    }


    async getPremiumUsers(userId: string): Promise<PremiumItem | null> {
        const premiumSql = 'SELECT amountSpent, endDateOfWork FROM premium WHERE userId = ?';
        const [premiumRows] = await this.db.execute(premiumSql, [userId]);
        const premium = (premiumRows as any[])[0];

        if (!premium) {
            return null;
        }

        return premium as PremiumItem;
    }

    async getAllPremiumUsers(): Promise<any[]> {
        try {
            const sql = 'SELECT userId, amountSpent, endDateOfWork FROM premium';
            const [users] = await this.db.execute(sql);
            return users as any[];
        } catch (error) {
            console.error('Failed to get premium users:', error);
            throw error;
        }
    }

}

export default PremiumService;