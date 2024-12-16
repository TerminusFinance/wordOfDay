import {TaskType} from "./TaskType.ts";

export interface Rewards {
    name: string;
    img: string;
    count: number;
    tag: string;
}

export interface UserTask {
    taskId: number;
    text: string;
    coins: number;
    checkIcon: string;
    taskType: TaskType;
    type: string;
    completed: boolean;
    lastCompletedDate?: string | null;
    actionBtnTx?: string | null;
    txDescription?: string | null;
    etaps?: number | null;
    sortLocal?: string | null;
    dataSendCheck?: string | null;
    rewards? : Rewards[] | null;

}

export interface UserBasic {
    userId: string;
    userName: string;
    coins: number;
    codeToInvite: string;
    address: string;
    referral: string;
    createAt: string;
    dataUpdate: string;
    imageAvatar?: string | null;
    enabledAirDrop: number;
}

