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
	const [message, setMessage] = useState('Meu cu');


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
			    <DialogContent dividers style={{ width: 600}}>
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
					<div>
						<FormControl fullWidth style={{ marginTop: 20, marginBottom: 20, position: "relative"}} >
							<TextField
								labelId="messageOnDisconnect-label"
								id="messageOnDisconnect"
								variant="outlined"
								multiline
								maxRows={5}
								minRows={4}
								value={message}
								label={`Mensagem de desconexão`}
								name="messageOnDisconnect"
								onChange={(e) => setMessage(e.target.value)}
							/>
							<Button
							type="submit"
							color="primary"
							variant="contained"
							style={{ position: "absolute", right: 10, bottom: 10}}
							onClick={()=> handleChangeSetting({ target: { name: "messageOnDisconnect", value: message}})}
							>
								Salvar
							</Button>
						</FormControl>
						
					</div>
			    </DialogContent>
			
		    </Dialog>
    )
}

export default SettingModal