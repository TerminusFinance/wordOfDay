import React from "react";
import colors from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";

export const TasksScreen: React.FC = () => {

    const navigate = useNavigate();


    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black
        }}>



            <span style={{
                color: 'white'
            }}>Tasks</span>


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


                <DownDockBar initialSelected={"Tasks"} onPredictionsClick={() => {
                    navigate('/predictions')
                }} onProfileClick={() => {
                    navigate('/profile')
                }} onAirDropClick={() => {
                    navigate('/airDrop')
                }} onReferralsClick={() => {
                    navigate('/referrals')
                }} onTasksClick={() => {
                }}/>
            </div>

        </div>
    )
}