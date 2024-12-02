import React, {useEffect} from "react";
import colors from "../../viewComponents/Utilits.ts";
import Progressbar from "../../viewComponents/progressbar/Progressbar.tsx";
import {useNavigate} from "react-router-dom";
import {delay} from "ton/dist/utils/time";


export const LoadingScreen : React.FC = () => {

    const navigate = useNavigate();

    useEffect(() => {
        delay(2000).then(() => {
            navigate('/start');
        });

    }, []);

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
            }}>Loading...</span>

            <Progressbar bgIsV={false}/>

        </div>
    )
}