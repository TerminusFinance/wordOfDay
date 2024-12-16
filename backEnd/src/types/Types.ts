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
    etTx?: string | null;
    isLoading: boolean;
    dataSendCheck?: string | null;
    storedValues?: string | null;
    rewards?: Rewards[];
    completeLimit?: number | null;
    completeCount: number;
    isVisible: number;
}

export interface UserTaskFormated {
    taskId: number;
    text: string;
    coins: number;
    checkIcon: string;
    taskType: string;
    type: string;
    completed: boolean | number;
    lastCompletedDate?: string | null;
    actionBtnTx?: string | null;
    txDescription?: string | null;
    etaps?: number | null;
    etTx?: string | null;
    isLoading: boolean | number;
    dataSendCheck?: string | null;
    storedValues?: string | null;
    rewards?: string;
    completeLimit?: number | null;
    completeCount: number;
    isVisible: number;
    sortLocal?: string | null;
}

export interface Task {
    id: number;
    text: string;
    coins: number;
    checkIcon: string;
    taskType: string;
    type: string;
    actionBtnTx?: string | null;
    txDescription?: string | null;
    completeLimit?: number | null;
    completeCount: number;
    rewards?: string;
    isVisible: number;
}


export interface TaskCardProps {
    id: number;
    text: string;
    coins: number;
    completed: boolean;
    checkIcon: string;
    taskType: TaskType;
    type: string;
    actionBtnTx?: string | null;
    txDescription?: string | null;
    sortLocal?: string | null;
    rewards?: Rewards[];
    completeLimit?: number | null;
    completeCount: number;
    isVisible: number;
}


export interface MilestoneTask {
    type: "Milestone";

}

export interface SampleTask {
    type: 'Sample';
}

export interface DailyTask {
    type: 'Daily';
    lastDateUpdates: string;
}

export interface OpenUrlTask {
    type: 'OpenUrl';
    url: string;
}

export interface CheckNftTask {
    type: 'CheckNft';
    checkCollectionsAddress: string;
}

export interface StockRegTask {
    type: 'StockReg';
    url: string;
}

export interface CheckStarsSendersTask {
    type: 'CheckStarsSenders';
    unnecessaryWaste: number;
}

export interface CheckFriendsTask {
    type: 'CheckFriends';
    numberOfFriends: number;
}

export interface SubscribeToTgTask {
    type: 'SubscribeToTg';
    url: string;
    id: string;
}

export interface InternalChallengeTask {
    type: 'InternalChallenge';
    nameChallenge: string;
}

export interface TransferToneTask {
    type: 'TransferTone';
    price: number;
    addressToTransfer: string;
    rewardType: string;
}

export interface DaysChallengeTask {
    type: "DaysChallenge",
    price: number;
    addressToTransfer: string;
    days: number;
}

export interface StockTrTask {
    type: "StockTr";
    class: string;
    url: string;
    // walletForParent: string;
}

export type TaskType = SampleTask
    | OpenUrlTask
    | CheckNftTask
    | CheckFriendsTask
    | SubscribeToTgTask
    | StockRegTask
    | DailyTask
    | InternalChallengeTask
    | TransferToneTask
    | CheckStarsSendersTask
    | DaysChallengeTask
    | StockTrTask;


export const isStockTrTask = (taskType: TaskType): taskType is StockTrTask => {
    return taskType.type === "StockTr"
}
export const ISDailyTask = (taskType: TaskType): taskType is DailyTask => {
    return taskType.type === 'Daily';
}

export const IsCheckNftTask = (taskType: TaskType): taskType is CheckNftTask => {
    return taskType.type === 'CheckNft';
};

export const IsSubscribeToTg = (taskType: TaskType): taskType is SubscribeToTgTask => {
    return taskType.type === 'SubscribeToTg';
};

export const IsOpenUrl = (taskType: TaskType): taskType is OpenUrlTask => {
    return taskType.type === 'OpenUrl';
};

export const IsStockReg = (taskType: TaskType): taskType is StockRegTask => {
    return taskType.type === 'StockReg';
};

export const ISCheckFriends = (taskType: TaskType): taskType is CheckFriendsTask => {
    return taskType.type === 'CheckFriends';
};

export const IsInternalChallengeTask = (taskType: TaskType): taskType is InternalChallengeTask => {
    return taskType.type === 'InternalChallenge';
};

export const IsTransferToneTask = (taskType: TaskType): taskType is TransferToneTask => {
    return taskType.type === 'TransferTone';
}

export const IsCheckStarsSendersTask = (taskType: TaskType): taskType is CheckStarsSendersTask => {
    return taskType.type === 'CheckStarsSenders';
}

export const IsDaysChallengeTask = (taskType: TaskType): taskType is DaysChallengeTask => {
    return taskType.type === 'DaysChallenge';
}

export interface Rewards {
    name: string;
    img: string;
    count: number;
    tag: string;
}

export interface StoredValuesDayChallenge {
    dayCompleted: number;
    dateLastComplete: string;
}

export interface Address {
    address: string
}

export interface Invitations {
    inviter_id: string;
    invitee_id: string;
    coinsReferral: number;
}
