import React, { useEffect, useState } from "react";

interface HorizontalSelectorProps {
    tabs: string[];
    onTabSelect: (selectedTab: string) => void;
    firstSelectTab?: string;
}

export const HorizontalSelector: React.FC<HorizontalSelectorProps> = ({
                                                                          tabs,
                                                                          onTabSelect,
                                                                          firstSelectTab,
                                                                      }) => {
    const [selectedTab, setSelectedTab] = useState<string>(
        firstSelectTab || tabs[0]
    );
    const [isFirstSelectTabSet, setIsFirstSelectTabSet] = useState<boolean>(
        !!firstSelectTab
    );
    const [isPressed, setIsPressed] = useState<string | null>(null);
    useEffect(() => {
        // Вызов onTabSelect при начальной загрузке компонента, чтобы синхронизировать состояние с родительским компонентом
        onTabSelect(selectedTab);
    }, [selectedTab, onTabSelect]);

    useEffect(() => {
        // Обновление selectedTab при изменении firstSelectTab только если оно еще не было установлено
        if (firstSelectTab && !isFirstSelectTabSet) {
            setSelectedTab(firstSelectTab);
            onTabSelect(firstSelectTab);
            setIsFirstSelectTabSet(true);
        }
    }, [firstSelectTab, isFirstSelectTabSet, onTabSelect]);

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
        onTabSelect(tab);
    };

    return (
        <div
            style={{
                display: "flex",
                flexWrap: 'wrap',
                marginBottom: "16px",
                background: "#191B20", // Добавлен градиентный фон
                borderRadius: "16px",
                padding: "8px",
                justifyContent: 'space-around'
            }}
        >
            {tabs.map((tab) => (
                <button
                    key={tab}
                    style={{
                        padding: "12px 24px", // Увеличен отступ для кнопок
                        margin: "0 4px",
                        borderRadius: "14px",
                        border: "2px solid transparent",
                        cursor: "pointer",
                        backgroundColor: tab === selectedTab ? "#F0EFFB" : "transparent",
                        color: tab === selectedTab ? "#000" : "#FFF",
                        fontFamily: "MyCustomFont, sans-serif",
                        fontSize: "14px",
                        fontWeight: tab === selectedTab ? "bold" : "normal",
                        transition: "background-color 0.3s, border-color 0.3s", // Плавный переход для цвета фона и границы
                        boxShadow: tab === selectedTab ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none", // Тень для выбранной кнопки
                        transform: isPressed === tab ? "scale(0.95)" : "scale(1)",
                        outline: "none",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                    }}
                    onClick={() => handleTabClick(tab)}
                    onMouseDown={() => setIsPressed(tab)}
                    onMouseUp={() => setIsPressed(null)}
                    onMouseLeave={() => setIsPressed(null)}
                    onTouchStart={() => setIsPressed(tab)}
                    onTouchEnd={() => setIsPressed(null)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};