import React, {useEffect, useState} from "react";
import colors, {useTelegramBackButton} from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import IcCircleInf from "../../../assets/ico/ic_inco_circle.svg";
import {AboutAirDropModal} from "../../modal/aboutAirDrop/AboutAirDrop.tsx";
import IcBg from "../../../assets/ico/bg_air_drop.png";
import {useData} from "../../coreComponents/DataContext.tsx";
import {useToast} from "../../viewComponents/Toast.tsx";
import {Address, beginCell, toNano} from "ton-core";
import {useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import {getUserById} from "../../coreComponents/remoteWorks/UserRemote.ts";
import {checkTonTransfer, updateUser} from "../../coreComponents/remoteWorks/AirDropRemote.tsx";
import {ButtonIsDisabled} from "../../viewComponents/buttonIsDisabled/ButtonIsDisabled.tsx";
import {useTranslation} from "react-i18next";

const descriptions = "Airdrop — это распределение токенов по кошелькам игроков. Эти токены будут торговаться на ведущих биржах, и вы сможете либо продать их, либо держать у себя. Чтобы получить токены, вы должны подключить свой кошелек.\n" +
    "У пользователя есть возможность участвовать в розыгрышах призов от всех предстоящих партнерств Terminus Exchange Finance. Это включает в себя раздачу токенов, чистых монет и других интересных призов. Привязав свой кошелек и совершив транзакцию в 1 тонну, пользователи гарантируют, что они имеют право на получение этих призов, а также помогают поддерживать экосистему проекта и расширять ее возможности."

export const AirDropScreen: React.FC = () => {
    const navigate = useNavigate();
    const {dataApp, setDataApp} = useData();
    const [stateBtn, setStateBtn] = useState<"connectedWallet" | "sendTone" | "checkoutPayment">("connectedWallet");
    const {showToast} = useToast();
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [onOpenModalAbout, setOnOpenModalAbout] = useState(false);
    const [setUpAddress, setSetUpAddress] = useState(false);

    const {t} = useTranslation()

    try {
        useTelegramBackButton(true);
    } catch (e) {
        console.error("Error in useTelegramBackButton:", e);
    }

    useEffect(() => {
        if (!dataApp.address) {
            setStateBtn("connectedWallet");
        } else {
            setStateBtn("sendTone");
        }
    }, [dataApp.address]);

    const checkoutPayment = async () => {
        try {
            const result = await checkTonTransfer();
            if (result == true) {
                showToast("Congratulations! You are participating in the air drop", "success");
                setDataApp((prev) => ({...prev, enabledAirDrop: 1}));
                navigate(-1);
            } else {
                showToast("Try to check after a while", "error");
            }
        } catch (error) {
            console.error("Error in checkoutPayment:", error);
            showToast("Try to check after a while", "error");
        }
    };

    const sendTransactions = async () => {
        try {
            const amount = 1;
            const address = "UQArhA0JpC_dvGk1DY7MtItdrTaIMvctmHXcw73h5HHhmpGV";
            const body = beginCell().storeUint(0, 32).storeStringTail(dataApp.userId).endCell();
            const transaction = {
                validUntil: Date.now() + 1000000,
                messages: [
                    {
                        address: address,
                        amount: toNano(amount).toString(),
                        payload: body.toBoc().toString("base64"),
                    },
                ],
            };

            const addressWallet = wallet?.account?.address ? Address.parse(wallet.account.address as string) : undefined;
            if (!addressWallet) {
                tonConnectUI.modal.open();
            } else {
                setStateBtn("checkoutPayment");
                await tonConnectUI.sendTransaction(transaction);
            }
        } catch (error) {
            console.error("Error in sendTransactions:", error);
        }
    };

    const connectedWallet = async () => {
        if (!dataApp.address) {
            setSetUpAddress(true);
            if (wallet) {
                await tonConnectUI.disconnect();
            }
            tonConnectUI.modal.open();
        }
    };

    const updateAddressUsers = async (address: string) => {
        await updateUser({address});
        const userData = await getUserById();
        if (typeof userData === "object") {
            setDataApp(userData);
        }
    };

    useEffect(() => {
        const fetchAddress = async () => {
            const addressWallet = wallet?.account?.address ? Address.parse(wallet.account.address as string) : undefined;
            if (!dataApp.address && addressWallet && setUpAddress) {
                await updateAddressUsers(addressWallet.toString());
            }
        };
        fetchAddress();
    }, [wallet]);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        }}>
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundImage: `url(${IcBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <span style={{
                    color: colors.pink,
                    textAlign: 'center',
                    fontFamily: "UbuntuBold",
                    fontSize: '24px',
                    marginTop: '24px'
                }}>
                    {t('airDrop.air_drop')}
                </span>
                <span style={{
                    color: colors.white,
                    textAlign: 'center',
                    fontFamily: "UbuntuMedium",
                    fontSize: '16px',
                    padding: '0 12px'
                }}>
                    {t('airDrop.between_players')}
                </span>
                <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}>
                    <div style={{
                        display: 'inline-flex',
                        flexDirection: "row",
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '16px',
                        background: colors.white,
                    }} onClick={() => setOnOpenModalAbout(true)}>
                        <span style={{fontSize: '14px', color: colors.black, fontFamily: 'UbuntuMedium'}}>
                            {t('airDrop.read_more')}
                        </span>
                        <img src={IcCircleInf} style={{width: '16px', height: '16px'}}/>
                    </div>
                </div>
            </div>


            {dataApp.enabledAirDrop == 1 ? <span>
                Air drop is enabled!
                </span> :
                <div style={{
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}>
                            <span style={{
                                width: 'calc(100% - 48px)',
                                fontSize: '24px',
                                marginTop: '32px',
                                fontFamily: 'UbuntuBold',
                                color: colors.white,
                                textAlign: 'left',
                                paddingLeft: '24px',
                            }}>
                {t('airDrop.enable_air_drop')}
            </span>

                    <div style={{padding: '0 24px'}}>
                        <ButtonIsDisabled onClick={connectedWallet} disabled={stateBtn !== "connectedWallet"}
                                          tx={t('airDrop.connect_wallet')}/>
                    </div>

                    <div style={{padding: '0 24px'}}>
                        <ButtonIsDisabled onClick={sendTransactions} disabled={stateBtn !== "sendTone"}
                                          tx={t('airDrop.send_transaction')}/>
                    </div>

                    <div style={{padding: '0 24px'}}>
                        <ButtonIsDisabled onClick={checkoutPayment} disabled={stateBtn !== "checkoutPayment"}
                                          tx={t('airDrop.check_transaction')}/>
                    </div>


                </div>}


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
                    initialSelected={"airDrop"}
                    onPredictionsClick={() => navigate('/predictions')}
                    onProfileClick={() => navigate('/profile')}
                    onAirDropClick={() => {
                    }}
                    onReferralsClick={() => navigate('/referrals')}
                    onTasksClick={() => navigate('/tasks')}
                />
            </div>

            <AboutAirDropModal
                title={"AirDrop"}
                descriptions={descriptions}
                isVisible={onOpenModalAbout}
                onClose={() => setOnOpenModalAbout(false)}
            />
        </div>
    );
};