import React, { useEffect, useState } from "react";
import colors, { useTelegramBackButton } from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import { useNavigate } from "react-router-dom";
import { getPhrase, getUserPhraseData } from "../../coreComponents/remoteWorks/UserPhraseRemote.ts";
import {useTranslation} from "react-i18next";
import {useData} from "../../coreComponents/DataContext.tsx";

export const PredictionsScreen: React.FC = () => {
    const [isLoadingBtn, setIsLoadingBtn] = useState(false); // Состояние загрузки кнопки
    const [isComplete, setIsComplete] = useState(false); // Завершенность получения предсказания
    const [phraseData, setPhraseData] = useState<{ phrase: string; isToday: boolean } | null>(null); // Данные предсказания
    const navigate = useNavigate();
    const {setUserPhraseData} = useData()
    // Кэш для сохранения данных между переходами
    const cachedPhraseData = React.useRef<{ phrase: string; isToday: boolean } | null>(null);

    const {t} = useTranslation()

    useTelegramBackButton(false);

    useEffect(() => {
        if (!cachedPhraseData.current) {
            fetchPhraseData(); // Запрос, если данных в кэше нет
        } else {
            setPhraseData(cachedPhraseData.current); // Используем кэш
            if (cachedPhraseData.current.isToday) {
                setIsComplete(true);
            }
        }
    }, []);

    const fetchPhraseData = async () => {
        try {
            const result = await getUserPhraseData();
            if (result && typeof result === "object") {
                cachedPhraseData.current = result; // Сохраняем данные в кэш
                setPhraseData(result);
                setUserPhraseData(result)
                if (result.isToday) {
                    setIsComplete(true);
                }
            }
        } catch (error) {
            console.error("Error fetching phrase data:", error);
        }
    };

    const handleButtonClick = async () => {
        if (!isLoadingBtn && !isComplete) {
            setIsLoadingBtn(true);
            try {
                const result = await getPhrase(t('profile.languages'));
                if (result && typeof result === "object") {
                    await fetchPhraseData(); // Обновляем данные
                    setIsComplete(true);
                }
            } catch (error) {
                console.error("Error fetching phrase:", error);
            } finally {
                setIsLoadingBtn(false);
            }
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: "linear-gradient(135deg, #000000, #1B0033)",
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
                {t('predictions.prediction_the_day')}
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
                                cursor: isLoadingBtn ? 'default' : 'pointer',
                                position: 'relative',
                                zIndex: 1,
                                transition: 'opacity 0.5s ease',
                                opacity: isLoadingBtn ? 0.7 : 1,
                                outline: "none",
                                userSelect: "none",
                                WebkitTapHighlightColor: "transparent",
                            }}
                            disabled={isLoadingBtn}
                        >
                            {t('predictions.get')}
                        </button>

                        {/* Прогресс вокруг кнопки */}
                        {isLoadingBtn && (
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
                            {phraseData?.phrase}
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