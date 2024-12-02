import React, { CSSProperties, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import colors from "../../viewComponents/Utilits.ts";
import { useNavigate } from "react-router-dom";


const inputStyle = {
    background: 'transparent',
    border: '1px solid #fff',
    outline: 'none',
    color: colors.white,
    fontSize: '16px',
    padding: '10px',
    borderRadius: '5px',
    width: '100%',
};

const containerStyle: CSSProperties = {
    width: '100%',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: colors.black,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
};

const labelStyle = {
    color: colors.white,
    fontSize: '16px',
    fontFamily: 'UbuntuRegular',
};

const inputContainerStyle: CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
};


const fadeInUp = {
    animation: 'fadeInUp 1s ease-out',
};

const fadeInUpDelayed = {
    animation: 'fadeInUp 1.2s ease-out',
};

export const InitDataScreen: React.FC = () => {
    const [date, setDate] = useState<Date | null>(null);
    const [animal, setAnimal] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();


    const isFormComplete = date !== null && animal !== "" && color !== "";

    useEffect(() => {
        setAnimate(true);
    }, []);


    return (
        <div style={containerStyle}>

            <span style={{
                color: colors.pink,
                fontFamily: "UbuntuBold",
                fontSize: '48px',
                textAlign: 'center',
                marginBottom: '40px',
                ...(animate ? fadeInUp : {}),
            }}>
                Set your start Data
            </span>

            <div style={inputContainerStyle}>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    ...(animate ? fadeInUpDelayed : {}),
                }}>
                    <label htmlFor="date" style={labelStyle}>
                        Enter your date of birth
                    </label>
                    <DatePicker
                        id="date"
                        selected={date}
                        onChange={(date: Date) => setDate(date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select a date"
                        customInput={<input style={inputStyle} />}
                        popperPlacement="bottom-start"
                    />
                </div>


                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    ...(animate ? fadeInUpDelayed : {}),
                }}>
                    <label htmlFor="animal" style={labelStyle}>
                        Choose your favorite animal
                    </label>
                    <select
                        id="animal"
                        value={animal}
                        onChange={(e) => setAnimal(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">Choose an animal</option>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="bird">Bird</option>
                    </select>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    ...(animate ? fadeInUpDelayed : {}),
                }}>
                    <label htmlFor="color" style={labelStyle}>
                        Choose your favorite color
                    </label>
                    <input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{
                            width: '30px',
                            height: '30px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    />
                </div>

                {/* Кнопка */}
                <span
                    id="bottom-text"
                    style={{
                        textAlign: 'center',
                        fontFamily: 'UbuntuBold',
                        transform: isFormComplete ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease, color 0.3s ease',
                        color: isFormComplete ? colors.pink : colors.white,
                        fontSize: '16px',
                        cursor: isFormComplete ? 'pointer' : 'default',
                        userSelect: "none",
                        opacity: animate ? 1 : 0,
                        animation: animate ? 'fadeInUp 1.5s ease-out' : 'none',
                    }}
                    onClick={() => {
                        if (isFormComplete) navigate("/predictions");
                    }}
                >
                    Get right now -&gt;
                </span>
            </div>


            <style>
                {`
                    @keyframes fadeInUp {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
};
