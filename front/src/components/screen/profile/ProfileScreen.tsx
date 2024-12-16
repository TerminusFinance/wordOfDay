import React, {useState} from "react";
import colors, {useTelegramBackButton} from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import ProfileImage from "../../viewComponents/profileImage/ProfileImage.tsx";
import {useData} from "../../coreComponents/DataContext.tsx";
import {useTranslation} from "react-i18next";
import {changeLanguage} from "i18next";
export const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { dataApp, userPhraseData } = useData();


    const dockBarHeight = 60;
    const {t} = useTranslation()

    try {

        useTelegramBackButton(true)
    } catch (e) {
        console.log("error in postEvent - ", e)
    }

    const listLanguage = [
        {
            code: "RU",
        },
        {
            code: "EN",
        }
    ];

    const [selectedLanguage, setSelectedLanguage] = useState(listLanguage[1]);

    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh',
                position: 'relative',
                overflowX: 'hidden',
                background: colors.black,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    flexDirection: 'column',
                    width: '100%',
                    paddingBottom: `${dockBarHeight}px`, // Отступ для учета док-бара
                }}
            >
                <span
                    style={{
                        color: colors.pink,
                        textAlign: 'center',
                        fontFamily: "UbuntuBold",
                        fontSize: '24px',
                        marginTop: '48px',
                    }}
                >
                    {t('profile.profile')}
                </span>
                <div style={{ height: '32px' }} />
                <ProfileImage imageSrc={dataApp.imageAvatar ? dataApp.imageAvatar : ""} badgeText={dataApp.userName} />

                <span
                    style={{
                        width: 'calc(100% - 48px)',
                        fontSize: '24px',
                        marginTop: '32px',
                        fontFamily: 'UbuntuBold',
                        color: colors.white,
                        textAlign: 'left',
                    }}
                >
                    {t('profile.statistics')}
                </span>

                <ItemTx txUno={t('profile.words_you_received')} txDos={userPhraseData.totalPhrases.toString()} />
                <ItemTx txUno={t("profile.yours_friends")} txDos={"10"} />

                <span
                    style={{
                        width: 'calc(100% - 48px)',
                        fontSize: '24px',
                        marginTop: '32px',
                        fontFamily: 'UbuntuBold',
                        color: colors.white,
                        textAlign: 'left',
                    }}
                >
                       {t('profile.app_settings')}
                </span>

                <ItemTxMenu txUno={t('profile.language')} txDos={selectedLanguage.code} openedMenu={["EN", "RU"]} onSelect={(code) => {
                    setSelectedLanguage({code})
                    changeLanguage(code.toLowerCase())
                }} />
                <ItemTx txUno={t('profile.air_drop')} txDos={dataApp.enabledAirDrop ? t('profile.on') : t('profile.off')} />
            </div>

            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <DownDockBar
                    initialSelected={"Profile"}
                    onPredictionsClick={() => {
                        navigate('/predictions');
                    }}
                    onProfileClick={() => {}}
                    onAirDropClick={() => {
                        navigate('/airDrop');
                    }}
                    onReferralsClick={() => {
                        navigate('/referrals');
                    }}
                    onTasksClick={() => {
                        navigate('/tasks');
                    }}
                />
            </div>
        </div>
    );
};


interface ItemTxParam {
    txUno: string;
    txDos: string;
    onClick?: () => void | null
}

export const ItemTx: React.FC<ItemTxParam> = ({txUno, txDos, onClick}) => {


    return (
        <div style={{
            backgroundColor: colors.white,
            padding: '20px 30px',
            borderRadius: '15px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
            gap: '16px',
            marginTop: '16px',
            width: 'calc(100% - 48px)',
        }} onClick={onClick}>
                        <span style={{
                            color: colors.black,
                            fontSize: '16px',
                            fontFamily: "UbuntuBold",
                        }}>
                            {txUno}
                        </span>
            <span style={{
                color: colors.black,
                fontSize: '20px',
                fontFamily: "UbuntuBold",
            }}>
                          {txDos}
                        </span>


        </div>
    )

}



interface ItemTxMenuParam {
    txUno: string;
    txDos: string;
    openedMenu: string[]; // Список вариантов меню
    onSelect: (selected: string) => void; // Callback для передачи выбранного значения
}

export const ItemTxMenu: React.FC<ItemTxMenuParam> = ({ txUno, txDos, openedMenu, onSelect }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Управляет отображением меню
    const [selectedItem, setSelectedItem] = useState(txDos); // Текущий выбранный элемент

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen); // Переключаем видимость меню
    };

    const handleMenuItemClick = (item: string) => {
        setSelectedItem(item); // Устанавливаем выбранный элемент
        setIsMenuOpen(false); // Закрываем меню
        onSelect(item); // Вызываем callback с выбранным значением
    };

    return (
        <div
            style={{
                backgroundColor: '#fff',
                padding: '20px 30px',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginTop: '16px',
                width: 'calc(100% - 48px)',
                position: 'relative',
            }}
        >
      <span
          style={{
              color: '#000',
              fontSize: '16px',
              fontFamily: 'UbuntuBold',
          }}
      >
        {txUno}
      </span>
            <div style={{ position: 'relative' }}>
        <span
            style={{
                color: '#000',
                fontSize: '20px',
                fontFamily: 'UbuntuBold',
                cursor: 'pointer',
            }}
            onClick={handleMenuToggle} // Открываем/закрываем меню при клике
        >
          {selectedItem}
        </span>

                {/* Меню */}
                {isMenuOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 0',
                            zIndex: 10,
                            minWidth: '120px',
                        }}
                    >
                        {openedMenu.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    color: selectedItem === item ? colors.pink : '#000',
                                    backgroundColor: selectedItem === item ? '#f0f0f0' : 'transparent',
                                    fontFamily: 'UbuntuBold',
                                }}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
