import React, { useState, useEffect } from "react";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	
}));

const ScheduleMessage = ({ onSubmit, setDate }) => {
	const classes = useStyles();

	return (
		<div >
			<form noValidate onSubmit={onSubmit}>
                <TextField
                    id="datetime-local"
                    label="Data"
                    type="datetime-local"
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                    onChange={(e)=> { setDate(e.target.value) }}
                />
                </form>
		</div>
	);
};

export default ScheduleMessage;
