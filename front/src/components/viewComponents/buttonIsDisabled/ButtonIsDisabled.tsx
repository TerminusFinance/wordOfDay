import React, {useState} from "react";
import colors from "../Utilits.ts";

interface ButtonIsDisabledParam {
    tx: string;
    onClick: () => void;
    imgInTx?: string | null;
    disabled?: boolean; // Новый параметр для управления активностью кнопки
}

export const ButtonIsDisabled: React.FC<ButtonIsDisabledParam> = ({tx, onClick, imgInTx, disabled = false}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <div
            style={{
                width: '100%',
                paddingLeft: 32,
                paddingRight: 32,
                paddingTop: 16,
                paddingBottom: 16,
                background: disabled ? colors.gray : colors.pink, // Серый цвет, если кнопка неактивна
                borderRadius: 999,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'inline-flex',
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
                cursor: disabled ? "not-allowed" : "pointer", // Указывает, что кнопка неактивна
                transform: isPressed && !disabled ? "scale(0.95)" : "scale(1)", // Анимация только если кнопка активна
                boxShadow: isPressed && !disabled
                    ? "0 4px 8px rgba(0, 0, 0, 0.2)"
                    : "",
                outline: "none",
                userSelect: "none",
                border: "none",
                WebkitTapHighlightColor: "transparent",
                opacity: disabled ? 0.6 : 1, // Полупрозрачность, если кнопка неактивна
            }}
            onClick={() => {
                if (!disabled) onClick(); // Нажатие обрабатывается только если кнопка активна
            }}
            onMouseDown={() => !disabled && setIsPressed(true)}
            onMouseUp={() => !disabled && setIsPressed(false)}
            onMouseLeave={() => !disabled && setIsPressed(false)}
            onTouchStart={() => !disabled && setIsPressed(true)}
            onTouchEnd={() => !disabled && setIsPressed(false)}
        >
            <div style={{
                textAlign: 'right',
                color: disabled ? colors.darkGray : colors.black, // Цвет текста меняется, если кнопка неактивна
                fontSize: 16,
                fontFamily: 'UbuntuBold',
            }}>
                {tx}
            </div>
            {imgInTx &&
                <img
                    src={imgInTx}
                    style={{
                        width: '16px',
                        height: '16px',
                        opacity: disabled ? 0.6 : 1, // Полупрозрачность иконки, если кнопка неактивна
                    }}
                />
            }
        </div>
    );
};