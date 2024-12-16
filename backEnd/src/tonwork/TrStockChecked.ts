import axios from "axios";
import {Address, toNano} from "ton-core";

// types.ts

export interface WalletAddress {
    address: string;
    is_scam: boolean;
    is_wallet: boolean;
}

export interface Jetton {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image: string;
    verification: string;
}

export interface Balance {
    balance: string;
    wallet_address: WalletAddress;
    jetton: Jetton;
}

export interface BalancesResponse {
    balances: Balance[];
}

export const checkedStakedToken = async (walletAddress: string, tokenAddress: string) => {
    try {
        const response = await axios.get<BalancesResponse>(`https://tonapi.io/v2/accounts/${walletAddress}/jettons`);
        const balances = response.data.balances;

        console.log("response is checkedStakedToken", response)
        // Найти элемент по jetton.name
        const matchedToken = balances.find(balance => Address.parse(balance.jetton.address).toString() === tokenAddress);
        console.log("matchedToken is ", matchedToken)
        if (matchedToken) {
            console.log("isBalanee is ", toNano(matchedToken.balance))
            if(toNano(matchedToken.balance) > toNano(1)) {
                return "Is Staked True"
            }else {
                return `Is balance - ${balances}`
            }
        } else {
            return `Token with name "${tokenAddress}" not found.`;
        }
    } catch (e) {
        console.error('Error fetching token data:', e);
        return `Error fetching data: ${e}`;
    }
}