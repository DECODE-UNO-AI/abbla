import React from "react";
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
} from '@material-ui/core';

import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";


import useWhatsApps from "../../hooks/useWhatsApps";


import { i18n } from "../../translate/i18n.js";


const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
		display: "flex",
		flexWrap: "wrap",
        padding: 50,
	},
    paper: {
		padding: theme.spacing(2),
		display: "flex",
		alignItems: "center",
	},
}));

const SettingModal = ({ openModal, onClose, children, settings, getSettingValue, handleChangeSetting }) => {

    const classes = useStyles();
    const { whatsApps } = useWhatsApps();

    return(
        <div className={classes.root}>
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
			    </DialogContent>
			
		    </Dialog>
        </div>
    )
}

export default SettingModal