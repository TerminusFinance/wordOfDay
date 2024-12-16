import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info', endTime?: string, endWork?: () => void) => void;
}

interface ToastProviderProps {
    children: ReactNode;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<
        Array<{ id: number; message: string; type: 'success' | 'error' | 'info'; endTime?: string; endWork?: () => void }>
    >([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info', endTime?: string, endWork?: () => void) => {
        const toast = { id: Date.now(), message, type, endTime, endWork };
        setToasts((prevToasts) => [...prevToasts, toast]);

        let duration = 3000; // Default duration

        if (endTime) {
            const endTimestamp = new Date(endTime).getTime();
            const remainingTime = endTimestamp - Date.now();
            duration = Math.max(remainingTime, 0);
        }

        setTimeout(() => {
            removeToast(toast.id);
        }, duration + 500); // Adding 500ms for the fade-out animation
    };

    const removeToast = (id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '16px',
                    right: '16px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        endTime={toast.endTime}
                        endWork={toast.endWork}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    endTime?: string;
    endWork?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, endTime, endWork }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let duration = 3000; // Default duration

        if (endTime) {
            const endTimestamp = new Date(endTime).getTime();
            const remainingTime = endTimestamp - Date.now();
            duration = Math.max(remainingTime, 0);
        }

        const hideTimeout = setTimeout(() => {
            setVisible(false);
            if (endWork) endWork(); // Call endWork after the toast is hidden
        }, duration);

        if (endTime) {
            const endTimestamp = new Date(endTime).getTime();
            const updateCountdown = () => {
                const remainingTime = endTimestamp - Date.now();
                setTimeLeft(Math.max(remainingTime, 0));
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);

            return () => {
                clearInterval(interval);
                clearTimeout(hideTimeout);
            };
        } else {
            return () => clearTimeout(hideTimeout);
        }
    }, [endTime, endWork]);

    const backgroundColors: Record<string, string> = {
        success: 'rgba(3, 152, 85, 16%)',
        error: '#f44336',
        info: '#2196f3',
    };

    return (
        <div
            style={{
                padding: '10px 20px',
                color: 'white',
                fontSize: '16px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s, transform 0.5s',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '100px',
                justifyContent: 'space-between',
                backgroundColor: backgroundColors[type],
                transform: visible ? 'translateY(0)' : 'translateY(-10px)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ flexGrow: 1 }}>{message}</div>
                {timeLeft !== null && (
                    <div style={{ marginLeft: '10px', fontSize: '12px', color: '#fff' }}>
                        {Math.floor(timeLeft / 1000)}s
                    </div>
                )}
            </div>
        </div>
    );
};