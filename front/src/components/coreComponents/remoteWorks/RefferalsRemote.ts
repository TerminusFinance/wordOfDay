import axios from "axios";
import {BASE_URL, initDataRaw} from "./GlobalRemote.tsx";

interface GetUserInvitedResponse {
    invitees: listUserInvitedItem[];
    totalCount: number;
}

export interface listUserInvitedItem {
    userId: string,
    userName: string,
    coinsReferral: number
}

export const getUserInvited = async () => {
    try {
        const response = await axios.get<GetUserInvitedResponse>(`${BASE_URL}users/getInviterUsers`,
            {headers: {Authorization: `tma ${initDataRaw}`}})
        // Распакуйте данные из ответа
        const { invitees, totalCount } = response.data;

        // Вы можете сделать с данными что угодно
        console.log("Invitees:", invitees);
        console.log("Total Count:", totalCount);

        return { invitees, totalCount };
    } catch (e) {
        console.log("checkTonTransfer - ", e)
        return `error ${e}`
    }
}