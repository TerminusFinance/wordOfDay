import React, { useState } from "react";
import colors from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import { useNavigate } from "react-router-dom";

export const PredictionsScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const navigate = useNavigate();

    const handleButtonClick = () => {
        if (!isLoading && !isComplete) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setIsComplete(true);
            }, 3000);
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>

            <span style={{
                color: colors.pink,
                textAlign: 'center',
                fontFamily: "UbuntuBold",
                fontSize: '24px',
                marginTop: '48px',
            }}>
                Get a prediction of the day
            </span>


            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {!isComplete ? (
                    <>
                        {/* Кнопка */}
                        <button
                            onClick={handleButtonClick}
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: colors.pink,
                                color: colors.white,
                                fontSize: '24px',
                                fontFamily: "UbuntuBold",
                                cursor: isLoading ? 'default' : 'pointer',
                                position: 'relative',
                                zIndex: 1,
                                transition: 'opacity 0.5s ease',
                                opacity: isLoading ? 0.7 : 1,
                                outline: "none",
                                userSelect: "none",
                                WebkitTapHighlightColor: "transparent",
                            }}
                            disabled={isLoading}
                        >
                            Get
                        </button>

                        {/* Прогресс вокруг кнопки */}
                        {isLoading && (
                            <div style={{
                                position: 'absolute',
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                border: `4px solid ${colors.white}`,
                                borderTop: `4px solid ${colors.pink}`,
                                animation: 'spin 1s linear infinite', // Вращение прогресса
                            }}></div>
                        )}
                    </>
                ) : (
                    <div style={{
                        backgroundColor: colors.white,
                        padding: '20px 30px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                        textAlign: 'center',
                        animation: 'fadeIn 1s ease-out',
                    }}>
                        <span style={{
                            color: colors.black,
                            fontSize: '20px',
                            fontFamily: "UbuntuBold",
                        }}>
                            Your prediction is ready!
                        </span>
                    </div>
                )}
            </div>

            {/* Док-бар */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <DownDockBar
                    initialSelected={"Predictions"}
                    onPredictionsClick={() => {}}
                    onProfileClick={() => navigate('/profile')}
                    onAirDropClick={() => navigate('/airDrop')}
                    onReferralsClick={() => navigate('/referrals')}
                    onTasksClick={() => navigate('/tasks')}
                />
            </div>

            {/* Анимации */}
            <style>
                {`
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes fadeIn {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);   
                        }
                    }
                `}
            </style>
        </div>
    );
};
