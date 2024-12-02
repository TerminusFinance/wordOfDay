import React from "react";
import colors from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import icCoins from "../../../assets/ico/ic_coins.svg";

export const TasksScreen: React.FC = () => {

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
                Tasks
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
                Completed task, and get prize
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

interface TaskItemParam {
    image: string;
    name: string;
    price: number;
}

export const TaskItem: React.FC<TaskItemParam> = ({image, name, price}) => {

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

            <div style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '6px'
            }}>

                <img src={image} style={{
                    width: '32px',
                    height: '32px',
                }}/>

            <span style={{
                fontSize: '16px',
                fontFamily: "UbuntuBold",
            }}>
                            {name}
                        </span>
            </div>


            <div style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                gap: '6px'
            }}>


            <span style={{
                color: colors.black,
                fontSize: '20px',
                fontFamily: "UbuntuBold",
            }}>
                          {price}
                        </span>

                <img src={icCoins} style={{
                    width: '32px',
                    height: '32px',
                    filter: 'brightness(0) saturate(100%) invert(61%) sepia(72%) saturate(157%) hue-rotate(296deg) brightness(95%) contrast(102%)'
                }}/>
            </div>


        </div>
    )
}