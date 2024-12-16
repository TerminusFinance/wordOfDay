import React from "react";
import colors from "../Utilits.ts";

interface ProfileImageWithBadgeProps {
    imageSrc: string;
    badgeText: string;
    badgeColor?: string;
    badgeTextColor?: string;
    size?: number;
}

const ProfileImageWithBadge: React.FC<ProfileImageWithBadgeProps> = ({
                                                                         imageSrc,
                                                                         badgeText,
                                                                         badgeTextColor = "#FFFFFF",
                                                                         size = 100,
                                                                     }) => {

    return (
        <div
            style={{
                position: "relative",
                width: `${size}px`,
                height: `${size}px`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >

            <div
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    clipPath: "circle(50% at 50% 50%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: `0 0 0 2px ${colors.pink}`, // Тень-обводка
                    background: "white", // Чтобы обводка контрастировала
                }}
            >
                <img
                    src={imageSrc}
                    alt="Profile"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </div>


            <div
                style={{
                    position: "absolute",
                    bottom: "-10px",
                    color: badgeTextColor,
                    background: colors.black,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    fontFamily: 'UbuntuBold',
                    display: "flex",
                    justifyContent: "center",
                    boxShadow: `0 0 0 2px ${colors.pink}`,
                    alignItems: "center",
                    whiteSpace: "nowrap",
                }}
            >
                {badgeText}
            </div>
        </div>
    );
};

export default ProfileImageWithBadge;