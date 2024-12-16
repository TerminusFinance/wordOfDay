import React, { useState } from "react";
import IcClose from "../../../assets/ico/ic_close.svg";

interface ButtonCloseParam {
    sizeBtn?: number;
    sizeImg?: number;
    onClick: () => void;
}

export const ButtonClose: React.FC<ButtonCloseParam> = ({ sizeBtn, sizeImg, onClick }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div
            style={{
                width: sizeBtn ? `${sizeBtn}px` : "32px",
                height: sizeBtn ? `${sizeBtn}px` : "32px",
                borderRadius: "999px",
                background: "#252830",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease",
                cursor: "pointer",
                transform: isPressed ? "scale(0.95)" : "scale(1)",
                boxShadow: isPressed
                    ? "0 2px 4px rgba(0, 0, 0, 0.2)"
                    : "",
                outline: "none",
                userSelect: "none",
                border: "none",
                WebkitTapHighlightColor: "transparent", // Убираем выделение на мобильных устройствах
            }}
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            <img
                src={IcClose}
                style={{
                    width: sizeImg ? `${sizeImg}px` : "16px",
                    height: sizeImg ? `${sizeImg}px` : "16px",
                }}
            />
        </div>
    );
};