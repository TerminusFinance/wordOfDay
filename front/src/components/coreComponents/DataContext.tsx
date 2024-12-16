import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserBasic } from "./types/UserType.ts";
import { UserPhraseData } from './types/phraseTypes.ts';

// Определение интерфейсов


interface DataContextType {
    dataApp: UserBasic;
    setDataApp: React.Dispatch<React.SetStateAction<UserBasic>>;
    userPhraseData: UserPhraseData;
    setUserPhraseData: React.Dispatch<React.SetStateAction<UserPhraseData>>;
}

// Создание контекста
const DataContext = createContext<DataContextType | undefined>(undefined);

// Создание провайдера
interface DataProviderProps {
    children: ReactNode;
}

const initialUserBasic: UserBasic = {
    address: "",
    codeToInvite: "",
    coins: 0,
    createAt: "",
    dataUpdate: "",
    enabledAirDrop: 0,
    referral: "",
    userId: "",
    userName: ""
};

const initialUserPhraseData: UserPhraseData = {
    phrase: "",
    dateReceived: "",
    totalPhrases: 0,
    isToday: false,
};

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [dataApp, setDataApp] = useState<UserBasic>(() => {
        const storedData = localStorage.getItem('dataApp');
        return storedData ? JSON.parse(storedData) : initialUserBasic;
    });

    const [userPhraseData, setUserPhraseData] = useState<UserPhraseData>(() => {
        const storedPhraseData = localStorage.getItem('userPhraseData');
        return storedPhraseData ? JSON.parse(storedPhraseData) : initialUserPhraseData;
    });

    useEffect(() => {
        localStorage.setItem('dataApp', JSON.stringify(dataApp));
    }, [dataApp]);

    useEffect(() => {
        localStorage.setItem('userPhraseData', JSON.stringify(userPhraseData));
    }, [userPhraseData]);

    return (
        <DataContext.Provider value={{ dataApp, setDataApp, userPhraseData, setUserPhraseData }}>
            {children}
        </DataContext.Provider>
    );
};

// Кастомный хук для использования контекста
const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export {DataProvider, useData};
export type { UserPhraseData };
