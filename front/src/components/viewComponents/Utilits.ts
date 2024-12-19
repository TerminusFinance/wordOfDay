import {on, postEvent} from "@telegram-apps/sdk";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";


const colors = {
    pink: '#FFC0CB',
    black: '#000000',
    white: '#FFFFFF',
    gold: '#C6A961',
    beige: '#F5E3C2',
    gray: "#B0BEC5", // Светло-серый цвет для неактивных кнопок
    darkGray: "#757575",
} as const;

export default colors;


const setupBackButton = (state: boolean) => {
    try {
        postEvent('web_app_setup_back_button', { is_visible: state });

    } catch (e) {
        console.log("error in postEvent - ", e);
    }
};

export const useTelegramBackButton = (state: boolean) => {
    const navigate = useNavigate();

    useEffect(() => {
        setupBackButton(state);

        const removeListener = on('back_button_pressed', () => {
            console.log('Back button pressed');
            navigate(-1);
        });

        return () => {
            removeListener();
        };
    }, [navigate]);
};

export const OpenUrl = (url: string) =>{
    window.open(url, '_blank');
}

export const sendToTgChose = (shareUrl: string) => {

    const shareMessage = `t.me/WordStreamBot/App?startapp=${shareUrl}
` +
        "\n" +
        "Play with me and get the opportunity to become a token holder through airdrop!\n" +
        "💸 +2k coins as your first gift\n" +
        "🔥 +10k coins if you have Telegram Premium";
    const telegramShareUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(shareMessage)}`;

    OpenUrl(telegramShareUrl)
}

