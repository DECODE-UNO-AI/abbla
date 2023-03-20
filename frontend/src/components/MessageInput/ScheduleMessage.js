import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	
}));

const ScheduleMessage = () => {
	const classes = useStyles();

	return (
		<div >
			<form noValidate>
                <TextField
                    id="datetime-local"
                    label="Data"
                    type="datetime-local"
                    defaultValue="2017-05-24T10:30"
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
                </form>
		</div>
	);
};

export default ScheduleMessage;
