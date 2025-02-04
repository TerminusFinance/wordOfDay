import React, { useEffect, useState } from "react";
import colors from "../../viewComponents/Utilits.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";



export const StartScreen: React.FC = () => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation()
    const {inviteCode} = location.state as { inviteCode: string | null }
    const {t} = useTranslation()

    useEffect(() => {
        const upperText = document.getElementById('upper-text');
        const bottomText = document.getElementById('bottom-text');

        if (upperText) {
            upperText.classList.add('animate-upper');
        }

        if (bottomText) {
            setTimeout(() => {
                bottomText.classList.add('animate-bottom');
            }, 1500); // Задержка для нижнего текста
        }
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>

            <span
                id="upper-text"
                style={{
                    color: colors.pink,
                    fontFamily: "UbuntuBold",
                    paddingBottom: '64px',
                    fontSize: '48px',
                    textAlign: 'start',
                    marginRight: '84px',
                    marginLeft: '32px',
                    whiteSpace: 'pre-wrap',
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `slide-up 1.5s ease-out forwards`,
                }}
            >
                {t('start.get_the_best')}
                <br />
                {t('start.phrase')}   <br />{t('start.of_the_day')}
            </span>

            <span
                id="bottom-text"
                style={{
                    textAlign: 'center',
                    fontFamily: 'UbuntuBold',
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `slide-up 1s ease-out 1.5s forwards`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: hovered ? colors.pink : colors.white,
                    fontSize: hovered ? '18px' : '16px',
                    outline: "none",
                    userSelect: "none",
                    border: "none",
                    WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => {navigate("/initData", {state: {inviteCode: inviteCode}})}}
            >
                {t('start.right_now')} -&gt;
            </span>

            <style>
                {`
                    @keyframes slide-up {
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
}
