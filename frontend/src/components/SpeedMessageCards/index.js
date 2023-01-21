import React, { useState } from "react";
import { Box, makeStyles } from "@material-ui/core";
import SpeedMessageCard from "../SpeedMessageCard";


const useStyles = makeStyles(theme => ({
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "space-beteewn",
        flexWrap: "wrap",
        gap: 10,
        "@media (max-width: 900px)": {
            gap: 4,
        },
        "@media (max-width: 720px)": {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        }
    },
    cardContainer: {
        flex: 1,
        maxWidth: 150,
        minHeight: 170,
        minWidth: 150,
    },
    content: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center"
    }
}));

const SpeedMessageCards = ({ delay, setDelay}) => {
    const classes = useStyles()

    return (
        <Box className={classes.container}>
            <SpeedMessageCard isSelected={delay === "15"} onClick={() => setDelay("15")} mainColor="#B4B1AE" title="Muito Lento" description="15 / Hora"/>
            <SpeedMessageCard isSelected={delay === "30"} onClick={() => setDelay("30")} mainColor="#14E2EC" title="Lento" description="30 / Hora"/>
            <SpeedMessageCard isSelected={delay === "60"} onClick={() => setDelay("60")} mainColor="#21E13E" title="Recomendado" description="60 / Hora"/>
            <SpeedMessageCard isSelected={delay === "120"} onClick={() => setDelay("120")} mainColor="#EDEA0E" title="Médio" description="120 / Hora"/>
            <SpeedMessageCard isSelected={delay === "240"} onClick={() => setDelay("240")} mainColor="#FC6D00" title="Rápido" description="240 / Hora"/>
        </Box>
    );
}

export default SpeedMessageCards;