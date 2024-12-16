import axios from "axios";
import {BASE_URL, initDataRaw} from "./GlobalRemote.tsx";
import {UserBasic} from "../types/UserType.ts";


interface resultCheckTonTransfer {
    resultrequest?: boolean| null
}
export const checkTonTransfer = async () => {
    try {
        const response = await axios.post<resultCheckTonTransfer>(`${BASE_URL}acquisitions/checkTonTransfer`, {
            amount: 1
        }, {headers: {Authorization: `tma ${initDataRaw}`}})

        if(response.data.resultrequest == true) {
            return true
        } else {
            return response.data.resultrequest
        }
    } catch (e) {
        console.log("checkTonTransfer - ", e)
        return `error ${e}`
    }
}

export interface UpdateUserRequest {
    coins?: number;
    userName?: string;
    address?: string;
}

export const updateUser = async (updates: Partial<UpdateUserRequest>): Promise<UserBasic> => {
    const payload = {...updates};
    console.log("payload - ", payload)
    try {
        const response = await axios.put<UserBasic>(`${BASE_URL}users/updateUsers`,
            payload, {headers: {Authorization: `tma ${initDataRaw}`}}
        );
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};