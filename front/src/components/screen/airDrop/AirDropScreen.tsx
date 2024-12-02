import React from "react";
import colors from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import {ButtonMain} from "../../viewComponents/buttonMain/ButtonMain.tsx";

export const AirDropScreen: React.FC = () => {

    const navigate = useNavigate();


    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'center'
        }}>



                 <span style={{
                     color: colors.pink,
                     textAlign: 'center',
                     fontFamily: "UbuntuBold",
                     fontSize: '24px',
                     marginTop: '48px',
                 }}>
                AirDrop
            </span>


            <span style={{
                color: colors.white,
                textAlign: 'center',
                fontFamily: "UbuntuMedium",
                fontSize: '16px',
                marginTop: '48px',
                paddingLeft: '12px',
                paddingRight: '12px'
            }}>
                Participate in airdrop to be the first and get a token, to participate you need to confirm that you are a person and make a transaction for 0.1 ton, after which you automatically become an airDrop participant
            </span>

            <div style={{
                paddingRight: '24px',
                paddingLeft: '24px'
            }}>
                <ButtonMain onClick={() => {}} tx={"Enjoi to air drop"} />
            </div>


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


                <DownDockBar initialSelected={"airDrop"} onPredictionsClick={() => {
                    navigate('/predictions')
                }} onProfileClick={() => {
                    navigate('/profile')
                }} onAirDropClick={() => {
                }} onReferralsClick={() => {
                    navigate('/referrals')
                }} onTasksClick={() => {
                    navigate('/tasks')
                }}/>
            </div>

        </div>
    )
}