import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";


const ConfirmationModal = ({ title, children, open, onClose, onConfirm, confirmLabel = "Agree", haveConfirmationSelect = false }) => {
	const [confirmChecked, setConfirmChecked] = useState(false)
	return (
		<Dialog
			open={open}
			onClose={() => onClose(false)}
			aria-labelledby="confirm-dialog"
		>
			<DialogTitle id="confirm-dialog">{title}</DialogTitle>
			<DialogContent dividers>
				<Typography>{children}</Typography>
				{
					haveConfirmationSelect ? 
					<Box style={{ marginTop: 20 }}>
						<FormControlLabel
							control={<Checkbox checked={confirmChecked} onChange={() => setConfirmChecked(e => !e)} name="confirmSelect" />}
							label={confirmLabel}
						/>
					</Box> : ""
				}
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => {
						onClose(false) 
						setConfirmChecked(false)
					}}
					color="default"
				>
					{i18n.t("confirmationModal.buttons.cancel")}
				</Button>
				<Button
					variant="contained"
					disabled={haveConfirmationSelect ? !confirmChecked : false}
					onClick={() => {
						setConfirmChecked(false)
						onClose(false);
						onConfirm();
					}}
					color="secondary"
				>
					{i18n.t("confirmationModal.buttons.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationModal;
