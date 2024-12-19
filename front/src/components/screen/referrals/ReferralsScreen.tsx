import React, {useEffect, useRef, useState} from "react";
import colors, {sendToTgChose, useTelegramBackButton} from "../../viewComponents/Utilits.ts";
import DownDockBar from "../../viewComponents/downDockBar/DownDockBar.tsx";
import {useNavigate} from "react-router-dom";
import {TaskItem} from "../tasks/TasksScreen.tsx";
import {ButtonMain} from "../../viewComponents/buttonMain/ButtonMain.tsx";
import {useData} from "../../coreComponents/DataContext.tsx";
import {getUserInvited, listUserInvitedItem} from "../../coreComponents/remoteWorks/RefferalsRemote.ts";
import Progressbar from "../../viewComponents/progressbar/Progressbar.tsx";

export const ReferralsScreen: React.FC = () => {

    const navigate = useNavigate();

    const {dataApp} = useData()

    try {

        useTelegramBackButton(true)
    } catch (e) {
        console.log("error in postEvent - ", e)
    }

    const [userInvitedItem, setuserInvitedItem] = useState<listUserInvitedItem[]>([])
    const [totalCountUsers, settotalCountUsers] = useState(0)
    const [loading, setLoading] = useState(false);
    const hasFetchedData = useRef(false)


    const requestToServ = async () => {
        const result = await getUserInvited()
        if (typeof result == "object") {
            setuserInvitedItem(result.invitees)
            settotalCountUsers(result.totalCount)
        }
    }

    useEffect(() => {
        if (!hasFetchedData.current) {
            setLoading(true)
            requestToServ().finally(() => {
                hasFetchedData.current = true
                setLoading(false)
            })
        }
    }, []);

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            position: 'relative',
            overflowX: 'hidden',
            background: colors.black,
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            alignItems: 'center',
        }}>


            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    flexDirection: 'column',
                    alignContent: 'center',
                    width: '100%',
                    paddingBottom: `${60}px`, // Отступ для учета док-бара
                }}
            >

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
                Your, have a {totalCountUsers} referrals
            </span>


                {userInvitedItem ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingRight: '16px',
                        paddingLeft: '16px',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                        {userInvitedItem.map((invite, pos) => (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                boxSizing: 'border-box',
                                paddingRight: '16px',
                                paddingLeft: '16px',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}>
                                <TaskItem
                                    key={pos}
                                    name={invite.userName}
                                    image={""}
                                    price={invite.coinsReferral}
                                    handleClick={() => {
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div/>
                )}

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


                <div style={{
                    width: 'calc(100% - 48px)',
                    marginBottom: '8px'
                }}>
                    <ButtonMain onClick={() => {
                        sendToTgChose(dataApp.codeToInvite)
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

            {loading && <Progressbar bgIsV={true}/>}

        </div>
    )
}