import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';



// Определение интерфейсов
interface User {
    userId: string;
    userName: string;
    gifts: number
}
interface DataContextType {
    dataApp: User;
    setDataApp: React.Dispatch<React.SetStateAction<User>>;
}

// Создание контекста
const DataContext = createContext<DataContextType | undefined>(undefined);

// Создание провайдера
interface DataProviderProps {
    children: ReactNode;
}

const initialUserBasic: User = {
    userId: "",
    userName: "",
    gifts: 0
};

const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [dataApp, setDataApp] = useState<User>(() => {
        return  initialUserBasic;
    });

    useEffect(() => {
        localStorage.setItem('dataApp', JSON.stringify(dataApp));
    }, [dataApp]);

    return (
        <DataContext.Provider value={{ dataApp, setDataApp}}>
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

export { DataProvider, useData };