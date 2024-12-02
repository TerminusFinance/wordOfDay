import React, { useState, useEffect } from 'react';
import icPredictions from "../../../assets/ico/ic_predictions.svg";
import ic_air_drop from "../../../assets/ico/ic_air_drop.svg";
import ic_profile from "../../../assets/ico/ic_profile.svg";
import ic_referrals from "../../../assets/ico/ic_referrals.svg";
import {useTranslation} from "react-i18next";
import colors from "../Utilits.ts";

type DownDockBarProps = {
    initialSelected: string;
    onPredictionsClick: () => void;
    onAirDropClick: () => void;
    onReferralsClick: () => void;
    onTasksClick: () => void;
    onProfileClick: () => void;
};

const DownDockBar: React.FC<DownDockBarProps> = ({
                                                         initialSelected,
                                                     onPredictionsClick,
                                                          onAirDropClick,
                                                          onReferralsClick,
                                                     onTasksClick,
                                                         onProfileClick,
                                                     }) => {
    const [selected, setSelected] = useState<string | null>(
        initialSelected.trim() !== "" ? initialSelected : null
    );

    useEffect(() => {
        setSelected(initialSelected.trim() !== "" ? initialSelected : null);
    }, [initialSelected]);

    const { t } = useTranslation();

    const getStyleForText = (isSelected: boolean): React.CSSProperties => ({
        fontSize: '10px',
        color: isSelected ? colors.pink : colors.beige,
        fontFamily: isSelected ? 'UbuntuMedium' : 'UbuntuRegular',
        marginTop: '5px',
    });

    const navBarStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: colors.black,
        width: '100%',
        marginLeft: '16px',
        marginRight: '16px',
        overflow: 'hidden',
    };

    const navItemStyle = (): React.CSSProperties => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '10px',
        width: '60px',
        boxSizing: 'border-box',
    });

    const getIconStyle = (isSelected: boolean): React.CSSProperties => ({
        width: '24px',
        height: '26px',
        filter: isSelected
            ? 'brightness(0) saturate(100%) invert(61%) sepia(72%) saturate(157%) hue-rotate(296deg) brightness(95%) contrast(102%)' // #FFC0CB
            : 'brightness(0) saturate(100%) invert(93%) sepia(23%) saturate(545%) hue-rotate(326deg) brightness(93%) contrast(89%)', // #F5E3C2
    });







    return (
        <div style={navBarStyle}>
            <div
                style={navItemStyle()}
                onClick={() => {
                    setSelected('Predictions');
                    onPredictionsClick();
                }}
            >
                <img src={icPredictions} alt="Predictions" style={getIconStyle(selected === 'Predictions')}/>
                <span style={getStyleForText(selected === 'Predictions')}>{t("navBar.Predictions")}</span>
            </div>

            <div
                style={navItemStyle()}
                onClick={() => {
                    setSelected('airDrop');
                    onAirDropClick();
                }}
            >
                <img src={ic_air_drop} alt="airDrop" style={getIconStyle(selected === 'airDrop')}/>
                <span style={getStyleForText(selected === 'airDrop')}>{t("navBar.AirDrop")}</span>
            </div>

            <div
                style={navItemStyle()}
                onClick={() => {
                    setSelected('Referrals');
                    onReferralsClick();
                }}
            >
                <img src={ic_referrals} alt="Referrals" style={getIconStyle(selected === 'Referrals')}/>
                <span style={getStyleForText(selected === 'Referrals')}>{t("navBar.Referrals")}</span>
            </div>

            <div
                style={navItemStyle()}
                onClick={() => {
                    setSelected('Tasks');
                    onTasksClick();
                }}
            >
                <img src={ic_profile} alt="Tasks" style={getIconStyle(selected === 'Tasks')}/>
                <span style={getStyleForText(selected === 'Tasks')}>{t("navBar.Tasks")}</span>
            </div>

            <div
                style={navItemStyle()}
                onClick={() => {
                    setSelected('Profile');
                    onProfileClick();
                }}
            >
                <img src={ic_profile} alt="Profile" style={getIconStyle(selected === 'Profile')}/>
                <span style={getStyleForText(selected === 'Profile')}>{t("navBar.Profile")}</span>
            </div>
        </div>
    );
};

export default DownDockBar;