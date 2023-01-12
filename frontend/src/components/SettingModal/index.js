import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	makeStyles,

} from '@material-ui/core';

import {
	InputLabel,
	MenuItem,
	FormControl,
	TextField,
	Typography,
	Button
} from '@material-ui/core';

import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";


import useWhatsApps from "../../hooks/useWhatsApps";


import { i18n } from "../../translate/i18n.js";


const useStyles = makeStyles(theme => ({
    paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},
}));

const SettingModal = ({ openModal, onClose, children, settings, getSettingValue, handleChangeSetting }) => {

    const classes = useStyles();
    const { whatsApps } = useWhatsApps();
	const [message, setMessage] = useState("");


	useEffect(()=> {
		setMessage(settings && settings.length > 0 && getSettingValue("messageOnDisconnect") ? getSettingValue("messageOnDisconnect") : 'O')
	}, [getSettingValue, settings])

    return(
            <Dialog
			open={openModal}
            onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
		    >
                <DialogTitle id="confirm-dialog">{`${i18n.t("settingModal.title")}`}</DialogTitle>
			    <DialogContent dividers>
                    { children }
                    <Paper className={classes.paper}>
						<FormControl fullWidth >
						<InputLabel id="notificationWhatsappId-label">{`${i18n.t("settingModal.form.connection")}`}</InputLabel>
						<Select
							labelId="notificationWhatsappId-label"
							id="notificationWhatsappId"
							value={settings && settings.length > 0 && getSettingValue("notificationWhatsappId") ? getSettingValue("notificationWhatsappId") : ''}
							label={`${i18n.t("settingModal.title")}`}
							name="notificationWhatsappId"
							onChange={(e) => handleChangeSetting(e)}
						>
							{
								whatsApps.map((w, index) => <MenuItem key={index} value={w.id}>{w.name}</MenuItem>)
							}
						</Select>
						</FormControl>
					</Paper>
					<Typography variant="body2" gutterBottom></Typography>
					<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
						<FormControl fullWidth style={{ marginTop: 20, marginBottom: 20}} >
							<TextField
								labelId="messageOnDisconnect-label"
								id="messageOnDisconnect"
								variant="outlined"
								multiline
								maxRows={5}
								minRows={4}
								value={message}
								label={`${i18n.t("settingModal.form.messageLabel")}`}
								name="messageOnDisconnect"
								onChange={(e) => setMessage(e.target.value)}
							/>
						</FormControl>
						<Button
						type="submit"
						color="primary"
						variant="contained"
						onClick={()=> handleChangeSetting({ target: { name: "messageOnDisconnect", value: message}})}
						>
							{`${i18n.t("settingModal.form.saveMessageButton")}`}
						</Button>
						
					</div>
			    </DialogContent>
			
		    </Dialog>
    )
}

export default SettingModal