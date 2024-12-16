import axios, {} from 'axios';
import {BASE_URL, initDataRaw} from "./GlobalRemote.tsx";
import {UserBasic, UserTask} from "../types/UserType.ts";



export const addCoinsToClickData = async (coins: number): Promise<UserBasic> => {
    try {
        const response = await axios.post<UserBasic>(`${BASE_URL}users/addCoins`,
            {coins}, {headers: {Authorization: `tma ${initDataRaw}`}}
        );
        console.log("addCoinsToClickData response - ",addCoinsToClickData)
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};


export const createUser = async (): Promise<UserBasic> => {
    try {
        const response = await axios.post<UserBasic>(
            `${BASE_URL}users/createNewUsers`,
            {}, {headers: {Authorization: `tma ${initDataRaw}`}}
        );

        console.log("response create - ", response.data)
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.log('Axios error response data:', error.response.data);
        }
        throw error;
    }
};


export const getUserById = async (): Promise<UserBasic | string> => {

    try {
        const response = await axios.get<UserBasic>(
            `${BASE_URL}users/getUser`, {headers: {Authorization: `tma ${initDataRaw}`}}
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

export const checkSuccessTask = async (taskId: number): Promise<UserTask[] | string> => {
    try {
        const response = await axios.post<UserTask[]>(`${BASE_URL}task/checkSuccessTask`, {
            taskId
        }, {headers: {Authorization: `tma ${initDataRaw}`}});
        console.log("response.data checkSuccessTask - ", response.data);
        if ('message' in response.data) {
            return `${response.data.message}`; // Возвращаем сообщение об ошибке
        }
        return response.data;
    } catch (e) {
        return `error ${e}`
    }
}

export const processInvitationFromInviteCode = async (inviteCode: string): Promise<UserBasic | string> => {
    try {
        await axios.post<{
            result: UserBasic
        }>(`${BASE_URL}users/processInvitation`,
            {inviteCode,}, {headers: {Authorization: `tma ${initDataRaw}`}}
        );

        const userResult = await getUserById()
        return userResult;
    } catch (error) {
        console.error('Error processing invitation:', error);
        console.error('Error getting user:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.log('Axios error response data:', error.response.data);
            return "User not found"
        }
        throw error;
    }
};

export const getTaskForUser = async () => {
    try {

        const result = await axios.get<UserTask[]>(`${BASE_URL}task/getTaskForUser`,
            {headers: {Authorization: `tma ${initDataRaw}`}}
        );

        return result.data;
    } catch (error) {
        console.error('Error processing invitation:', error);
        console.error('Error getting user:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.log('Axios error response data:', error.response.data);
            return "User not found"
        }
        throw error;
    }
}