import {UserTask} from "../types/UserType.ts";
import axios from "axios";
import {BASE_URL, initDataRaw} from "./GlobalRemote.tsx";

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