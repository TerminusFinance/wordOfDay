import axios from "axios";
import {BASE_URL, initDataRaw} from "./GlobalRemote.tsx";
import {UserPhrase, UserPhraseData} from "../types/phraseTypes.ts";

export const getPhrase = async (language: string): Promise<UserPhrase | string> => {

    try {
        const response = await axios.post<UserPhrase>(
            `${BASE_URL}phrase/getPhrase`,
            {language}, {headers: {Authorization: `tma ${initDataRaw}`}}
        );

        console.log('Response data:', typeof response.data);
        // if ('message' in response.data) {
        //     return `${response.data.message}`; // Возвращаем сообщение об ошибке
        // }
        return response.data; // Вернем результат из объекта response.data
    } catch (error) {
        console.error('Error getting user:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.log('Axios error response data:', error.response.data);
            return "User not found"
        }
        throw error;
    }
};


export const getUserPhraseData = async (): Promise<UserPhraseData | string> => {

    try {
        const response = await axios.get<UserPhraseData>(
            `${BASE_URL}phrase/getUserPhraseData`, {headers: {Authorization: `tma ${initDataRaw}`}}
        );

        console.log('Response data:', typeof response.data);
        // if ('message' in response.data) {
        //     return `${response.data.message}`; // Возвращаем сообщение об ошибке
        // }
        return response.data; // Вернем результат из объекта response.data
    } catch (error) {
        console.error('Error getting user:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.log('Axios error response data:', error.response.data);
            return "User not found"
        }
        throw error;
    }
};

