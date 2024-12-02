export interface User {
    userId: string;
    userName: string;
    codeToInvite: string;
    address: string;
    referral: string;
    createAt: string;
    dataUpdate: string;
    imageAvatar?: string | null;
    enabledAirDrop: number;
}
