import React, { useState } from "react";
import { Box, makeStyles } from "@material-ui/core";
import SpeedMessageCard from "../SpeedMessageCard";


const useStyles = makeStyles(theme => ({
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "space-beteewn",
        flexWrap: "wrap",
        gap: 10
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

const SpeedMessageCards = () => {
    const classes = useStyles();
    const [selectedCard, setSelectedCard] = useState(0);

    return (
        <Box className={classes.container}>
            <SpeedMessageCard isSelected={selectedCard === 0} onClick={() => setSelectedCard(0)} mainColor="#B4B1AE" title="Muito Lento" description="15 / Hora"/>
            <SpeedMessageCard isSelected={selectedCard === 1} onClick={() => setSelectedCard(1)} mainColor="#14E2EC" title="Lento" description="30 / Hora"/>
            <SpeedMessageCard isSelected={selectedCard === 2} onClick={() => setSelectedCard(2)} mainColor="#21E13E" title="Recomendado" description="60 / Hora"/>
            <SpeedMessageCard isSelected={selectedCard === 3} onClick={() => setSelectedCard(3)} mainColor="#EDEA0E" title="Médio" description="120 / Hora"/>
            <SpeedMessageCard isSelected={selectedCard === 4} onClick={() => setSelectedCard(4)} mainColor="#FC6D00" title="Rápido" description="240 / Hora"/>
        </Box>
    );
}

export default SpeedMessageCards;