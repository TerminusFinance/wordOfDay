import React from "react";
import colors from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import {TaskItem} from "../tasks/TasksScreen.tsx";
import {ButtonMain} from "../../viewComponents/buttonMain/ButtonMain.tsx";

export const ReferralsScreen: React.FC = () => {

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
            alignItems: 'center'
        }}>




       <span style={{
           color: colors.pink,
           textAlign: 'center',
           fontFamily: "UbuntuBold",
           fontSize: '24px',
           marginTop: '48px',
       }}>
                Referrals
            </span>

            <span style={{
                color: colors.white,
                textAlign: 'center',
                fontFamily: "UbuntuMedium",
                fontSize: '16px',
                marginTop: '16px',
                paddingLeft: '12px',
                paddingRight: '12px'
            }}>
                Your, top referrals
            </span>

            <TaskItem image={""} price={1000} name={"Subscribe to chanel"}/>


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


                <div style={{
                    width: 'calc(100% - 48px)',
                    marginBottom: '8px'
                }}>
                    <ButtonMain onClick={() => {
                    }} tx={"Invite"}/>
                </div>

                    <DownDockBar initialSelected={"Referrals"} onPredictionsClick={() => {
                        navigate('/predictions')
                    }} onProfileClick={() => {
                        navigate('/profile')
                    }} onAirDropClick={() => {
                        navigate('/airDrop')
                    }} onReferralsClick={() => {
                    }} onTasksClick={() => {
                        navigate('/tasks')
                    }}/>
                </div>

            </div>
            )
            }