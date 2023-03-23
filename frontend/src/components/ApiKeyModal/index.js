import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	DialogActions,
} from "@material-ui/core";


const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const ApiKeyModal = ({ open, onClose, ApiKey }) => {
	const classes = useStyles();
	const handleClose = () => {
		onClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle>
					Key
				</DialogTitle>

					<DialogContent dividers style={{ textAlign: "center" }}>
						{ApiKey}
					</DialogContent>
					<DialogActions>
						<Button
							onClick={handleClose}
							color="secondary"
							variant="outlined"
						>
							Fechar
						</Button>
					</DialogActions>
					
			
			</Dialog>
		</div>
	);
};

export default React.memo(ApiKeyModal);
