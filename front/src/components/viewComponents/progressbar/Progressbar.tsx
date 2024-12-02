import React from 'react';
import colors from "../Utilits.ts";

interface PgParam {
    bgIsV: boolean
}

const Progressbar: React.FC<PgParam> = ({bgIsV}) => {
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: bgIsV ? 'rgba(0, 0, 0, 0.3)' : "",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20000,
    };

    const barContainerStyle: React.CSSProperties = {
        width: '60%',
        maxWidth: '200px',
        height: '6px',
        backgroundColor: '#d0d0d0',
        borderRadius: '3px',
        overflow: 'hidden',
        position: 'relative',
    };

    const barFillStyle: React.CSSProperties = {
        width: '30%',
        height: '100%',
        backgroundColor: colors.pink,
        position: 'absolute',
        borderRadius: '3px',
        animation: 'movingBar 1.5s ease-in-out infinite',
    };

    const keyframesStyle = `
        @keyframes movingBar {
            0% { left: 0; }
            50% { left: 70%; }
            100% { left: 0; }
        }
    `;

    return (
        <>
            <style>{keyframesStyle}</style>
            <div style={overlayStyle}>
                <div style={barContainerStyle}>
                    <div style={barFillStyle}></div>
                </div>
            </div>
        </>
    );
};

export default Progressbar;