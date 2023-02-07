import React from "react";
import { Box, makeStyles, Paper, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    title: {
        color: "#979797",
        fontSize: "1.2rem"
    },
    number: {
        fontWeight: "bold",
        fontSize: "1.4rem"
    },
    infoContainer: {
        display: "flex",
        alignItems: "center",
        gap: 10
        
    }
}));

const CampaignNumberCard = ({children, color , number, title}) => {
    const classes = useStyles();

    return (
        <Paper style={
            {   
                paddingTop: 5, 
                paddingLeft: 15, 
                borderBottom: `3px solid ${color}`, 
                flex: 1, height: 100, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "start", 
                justifyContent: "center"
            }
        }>
            <Typography className={classes.title}>
                {title}
            </Typography>
            <Box className={classes.infoContainer}>
                {children}
                <Typography className={classes.number} style={{ color }}>
                    {number}
                </Typography>
            </Box>
        </Paper>
    );
}

export default CampaignNumberCard;