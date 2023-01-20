import React from "react";
import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import { SpeedOutlined } from "@material-ui/icons"

const useStyles = makeStyles(theme => ({
    cardContainer: {
        flex: 1,
        maxWidth: 150,
        minHeight: 170,
        minWidth: 150,
        cursor: "pointer"
    },
    content: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        "-webkit-user-select": "none", 
        "-ms-user-select": "none",
        "user-select": "none"
    },
    icon: {
        fontSize: 60,
        fontWeight: "bold"
    }
}));

const SpeedMessageCard = ({ mainColor, isSelected, title, description, onClick}) => {
    const classes = useStyles();

    return (
        <Card 
            className={classes.cardContainer} 
            style={ isSelected ? { color: "#fff", backgroundColor: mainColor, border: "none" } : { color: mainColor, border: `1px solid ${mainColor}` }}
            variant="outlined"
            onClick={onClick}
        >
                <CardContent className={classes.content}>
                    <SpeedOutlined className={classes.icon}/>
                    <Typography>
                        {title}
                    </Typography>
                    <Typography variant="caption">
                        {description}
                    </Typography>
                </CardContent>    
            </Card>
    );
}

export default SpeedMessageCard;