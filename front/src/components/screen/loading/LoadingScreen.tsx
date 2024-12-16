import React, {useEffect} from "react";
import colors from "../../viewComponents/Utilits.ts";
import Progressbar from "../../viewComponents/progressbar/Progressbar.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {getUserById} from "../../coreComponents/remoteWorks/UserRemote.ts";
import {useData} from "../../coreComponents/DataContext.tsx";
import {retrieveLaunchParams} from "@telegram-apps/sdk";
import {useTranslation} from "react-i18next";


export const LoadingScreen : React.FC = () => {

    const navigate = useNavigate();
    const {setDataApp} = useData()
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const inviteCode = params.get('inviteCode');
    const { t } = useTranslation()
    useEffect(() => {
        const fetchData = async () => {
            try {

                try {
                    const { initData } = retrieveLaunchParams();
                    const InitDataStaertParam = initData?.startParam
                    if(params != undefined) {
                        if(InitDataStaertParam != undefined) {

                            const InviteCodeParams = inviteCode != null ? inviteCode : InitDataStaertParam
                            const result = await getUserById();

                            if (typeof result ==="string") {
                                console.log("передал в  InitDataStaertParam параметр - ", InitDataStaertParam)

                                navigate('/start', {state: {inviteCode: InviteCodeParams}});
                            } else if (typeof result === 'object'){

                                const isClanInvite = InviteCodeParams.startsWith('CL');
                                console.log("isClanInvite - ", isClanInvite, "InviteCodeParams -", InviteCodeParams)
                                setDataApp(result);

                                if(isClanInvite) {
                                    const inviteCode = InviteCodeParams

                                    navigate('/predictions', { state: { inviteCode } });
                                } else  {
                                    navigate('/predictions');
                                }
                            }
                        } else  {

                            const result = await getUserById();
                            if (typeof result ==="string") {
                                if(!inviteCode) {

                                    console.log('User not found');
                                    navigate('/start', {state: {inviteCode: null}})
                                } else  {
                                    console.log('User not found');
                                    navigate('/start', {state: {inviteCode}});
                                }
                            } else if (typeof result === 'object'){
                                console.log("set up data - ", result.coins);
                                setDataApp(result);
                                navigate('/predictions');
                            }
                        }

                    } else {
                        if(InitDataStaertParam != undefined) {

                            const InviteCodeParams = inviteCode != null ? inviteCode : InitDataStaertParam
                            const result = await getUserById();


                            if (typeof result ==="string") {
                                console.log('User not found');
                                navigate('/start', {state: {InviteCodeParams}});

                            } else if (typeof result === 'object'){
                                console.log("set up data - ", result.coins);

                                setDataApp(result);
                                navigate('/predictions');
                            }
                        }
                    }
                } catch (e) {
                    console.log(e)
                    navigate('/not-found', {});
                }

            } catch (error) {
                console.error('Error:', error);
            }
        };
        //
        fetchData();
        // navigate('/check');

    }, [navigate])

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            background: colors.black,
            alignContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>


            <span style={{
                color: colors.pink,
                fontFamily: "UbuntuBold",
                paddingBottom: '48px',
                fontSize: '24px'
            }}>{t('loading.loading')}</span>

            <Progressbar bgIsV={false}/>

        </div>
    )
}