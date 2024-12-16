import {Connection} from "mysql2/promise";
import {botToken} from "../../confit";
import axios from "axios";
import PremiumService from "./PremiumService";
import {toNano} from "ton-core";
import {Address} from "../types/Types";
import {CheckTransactions} from "../tonwork/CheckToNftitem";


export interface AcquisitionsResult {
    userId: string;
    totalAmount: number;
    lastPurchase?: string | null;
    selectedPurchase?: string | null;
    selectedAmount: number;
}


export interface LabeledPrice {
    label: string;
    amount: number;
}

const allowedCategories = [
    'prem_6 hour',
    'prem_12 hour',
    'prem_24 hour',
    'prem_48 hour',
    'prem_one_time',
];

class AcquisitionsService {
    constructor(private db: Connection) {
    }

    async getAcquisitions(userId: string) {
        const selectQuery = 'SELECT * FROM acquisitions WHERE userId = ?';
        const [rows] = await this.db.execute(selectQuery, [userId]);
        const userLeague = (rows as AcquisitionsResult[])[0];
        return userLeague || null;
    }

    async sendToPaymentAcquisitions(userId: string, price: number, category: string): Promise<AcquisitionsResult | null> {

        // Проверка, входит ли категория в допустимый список
        if (!allowedCategories.includes(category)) {
            throw new Error(`Invalid category: ${category}. Allowed categories are: ${allowedCategories.join(', ')}`);
        }

        try {
            // Проверка существования записи для пользователя

            const checkQuery = `SELECT *
                                FROM acquisitions
                                WHERE userId = ?`;
            const [rows] = await this.db.execute(checkQuery, [userId]);
            console.log("rows is - ", rows)
            if ((rows as any[]).length === 0) {
                // Если запись не существует, создаем новую запись для пользователя
                const insertQuery = `
                    INSERT INTO acquisitions (userId, totalAmount, lastPurchase, selectedPurchase, selectedAmount)
                    VALUES (?, ?, ?, ?, ?)
                `;
                await this.db.execute(insertQuery, [userId, 0, category, category, price]);
            } else {
                // Если запись существует, обновляем её
                const updateQuery = `
                    UPDATE acquisitions
                    SET lastPurchase     = ?,
                        selectedPurchase = ?,
                        selectedAmount   = ?
                    WHERE userId = ?
                `;
                await this.db.execute(updateQuery, [category, category, price, userId]);
            }

            // Получаем обновленную запись
            const [updatedRows] = await this.db.execute(checkQuery, [userId]);
            const updatedRecord = (updatedRows as AcquisitionsResult[])[0];
            console.log("updatedRecord is - ", updatedRecord)
            return updatedRecord || null;
        } catch (error) {
            console.error('Failed to update acquisitions:', error);
            return null;
        }
    }

    async paymentVerification(userId: string, price: number): Promise<string | { error: string }> {
        try {
            // Проверяем существование записи и получаем данные
            const checkQuery = `SELECT *
                                FROM acquisitions
                                WHERE userId = ?`;
            const [rows] = await this.db.execute(checkQuery, [userId]);
            console.log("paymentVerification rows is - ", rows);

            if ((rows as any[]).length === 0) {
                return {error: 'No acquisition record found for the user.'};
            }

            const acquisition = (rows as AcquisitionsResult[])[0];

            if (!acquisition.selectedPurchase) {
                return {error: 'selectedPurchase is null'};
            }

            // Используем дельту для сравнения чисел с плавающей запятой
            const EPSILON = 0.00001;
            if (Math.abs(acquisition.selectedAmount - price) > EPSILON) {
                throw new Error('The price does not match the selected amount.');
            }

            // Обновляем записи
            const updateQuery = `
                UPDATE acquisitions
                SET totalAmount  = totalAmount + ?,
                    lastPurchase = selectedPurchase
                WHERE userId = ?
            `;
            await this.db.execute(updateQuery, [acquisition.selectedAmount, userId]);

            // Возвращаем selectedPurchase, если все прошло успешно
            return acquisition.selectedPurchase;

        } catch (e) {
            console.error('Error during payment verification:', e);
            return {error: 'An error occurred during payment verification.'};
        }
    }


    async sendPayment(chat_id: string, title: string, description: string, payload: string, currency: string, prices: LabeledPrice[], category: string) {

        if (!prices[0].amount) {
            throw new Error("amount in Prices is empty");
        }

        const resultAcquisitions = await this.sendToPaymentAcquisitions(chat_id, prices[0].amount, category)
        if (resultAcquisitions == null) {
            throw new Error("amount in Prices is empty");
        }

        const url = `https://api.telegram.org/bot${botToken}/createInvoiceLink`;
        const data = {
            chat_id: chat_id,
            title: title,
            description: description,
            payload: payload,
            currency: currency,
            prices: prices
        };

        try {
            const response = await axios.post(url, data);
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }


    async subscriptionProcessing(providerPaymentChargeId: string, totalAmount: number) {
        const id = providerPaymentChargeId.split('_')[0];

        const premiumController = new PremiumService(this.db);
        // const userLeagueController = new UserTopController(this.db);
        const resultPaymentVerification = await this.paymentVerification(id, totalAmount)

        if (typeof resultPaymentVerification == "object") {
            return resultPaymentVerification.error
        }
        console.log("subscriptionProcessing is - ", resultPaymentVerification)
        switch (resultPaymentVerification) {
            case "prem_6 hour":
                await premiumController.updateSubscription(id,  totalAmount, resultPaymentVerification);
                break;
            case "prem_12 hour":
                await premiumController.updateSubscription(id,  totalAmount, resultPaymentVerification);
                break;
            case "prem_24 hour":
                await premiumController.updateSubscription(id,  totalAmount, resultPaymentVerification);
                break;
            case "prem_one_time":
                await premiumController.updateSubscriptionOneTimePremium(id, totalAmount, resultPaymentVerification);
                break;

            default:

                    console.log("Unknown case:", resultPaymentVerification);

                break;


        }

        return true;
    }

    async checkOutTransferTone(userId: string, amount: number, walletReceiver: string) {
        try {
            if (amount == 1) {
                const userTaskSql = `
                    SELECT address
                    FROM users
                    WHERE userId = ?
                `;

                const [addressResultRow] = await this.db.execute(userTaskSql, [userId])
                const acquisition = (addressResultRow as Address[])[0];
                const address = acquisition.address
                if (typeof address == "string") {
                    const result = await CheckTransactions(userId, address, toNano(amount), walletReceiver)
                    if (result == true) {
                        const updateQuery = `
                            UPDATE users
                            SET enabledAirDrop = 1
                            WHERE userId = ?

                        `;
                        await this.db.execute(updateQuery, [userId])
                        console.log("setupIs goooge return true")
                        return true
                    } else {
                        return "Error"
                    }
                }
            }
        } catch (e) {
            return "Error"
        }
    }
}


export default AcquisitionsService;