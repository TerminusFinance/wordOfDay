

export type TaskType = SampleTask
    | OpenUrlTask
    | CheckNftTask
    | CheckFriendsTask
    | SubscribeToTg
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
export const isSampleTask = (taskType: TaskType): taskType is SampleTask => {
    return taskType.type === 'Sample';
};

export const isOpenUrlTask = (taskType: TaskType): taskType is OpenUrlTask => {
    return taskType.type === 'OpenUrl';
};

export const IsSubscribeToTg = (taskType: TaskType): taskType is SubscribeToTg => {
    return taskType.type === 'SubscribeToTg';
};

export const isCheckFriendsTask = (taskType: TaskType): taskType is CheckFriendsTask => {
    return taskType.type === 'CheckFriends';
};

export const CheckNftTask = (taskType: TaskType): taskType is CheckNftTask => {
    return taskType.type === 'CheckNft';
};

export const IsStockReg = (taskType: TaskType): taskType is StockRegTask => {
    return taskType.type === 'StockReg';
};
export const ISDailyTask = (taskType: TaskType): taskType is DailyTask => {
    return taskType.type === 'Daily';
}

export const IsInternalChallengeTask =  (taskType: TaskType): taskType is InternalChallengeTask => {
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

export const IsSampleTask = (taskType: TaskType): taskType is SampleTask => {
    return taskType.type === 'Sample';
}

export interface StockTrTask {
    type: "StockTr";
    class: string;
    url: string;
    // walletForParent: string;
}

export interface SampleTask {
    type: 'Sample';
}

export interface OpenUrlTask {
    type: 'OpenUrl';
    url: string;
}

export interface InternalChallengeTask {
    type: 'InternalChallenge';
    nameChallenge: string;
}

export interface DailyTask {
    type: 'Daily';
    lastDateUpdates: string;
}

export interface CheckNftTask {
    type: 'CheckNft'
    checkCollectionsAddress: string
}

export interface StockRegTask {
    type: 'StockReg';
    url: string;
}

export interface SubscribeToTg {
    type: 'SubscribeToTg';
    url: string;
    id: string;
}

export interface CheckFriendsTask {
    type: 'CheckFriends';
    numberOfFriends: number;
}

export interface TransferToneTask {
    type: 'TransferTone';
    price: number;
    addressToTransfer: string;
    rewardType: string;
}

export interface CheckStarsSendersTask {
    type: 'CheckStarsSenders';
    unnecessaryWaste: number;
}

export interface DaysChallengeTask {
    type : "DaysChallenge",
    price: number;
    addressToTransfer: string;
    days: number;
}