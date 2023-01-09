import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { 
	Formik, 
	Form, 
	Field 
} from "formik";

import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	makeStyles,
	TextField,
} from "@material-ui/core";

import { green } from "@material-ui/core/colors";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
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

	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},

	colorAdorment: {
		width: 20,
		height: 20,
	},
}));

const DepartamentSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	description: Yup.string(),
});

const DepartamentModal = ({ open, onClose, departamentId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		description: "",
		queueIds: []
	};

	const [departament, setDepartament] = useState(initialState);
    const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const descriptionRef = useRef();

	useEffect(() => {
		(async () => {
			if (!departamentId) return;
			try {
				const { data } = await api.get(`/departament/${departamentId}`);
                const departamentQueues = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(departamentQueues);
				setDepartament(prevState => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setDepartament({
				name: "",
		        description: "",
		        queueIds: []
			});
		};
	}, [departamentId, open]);

	const handleClose = () => {
		onClose();
		setDepartament(initialState);
	};

	const handleSaveQueue = async values => {
        const departamentData = { ...values, queueIds: selectedQueueIds };
		 try {
		 	if (departamentId) {
		 		await api.put(`/departament/${departamentId}`, departamentData);
		 	} else {
		 		await api.post("/departament", departamentData);
		 	}
		 	toast.success(`${i18n.t("departamentModal.notification.title")}`);
		 	handleClose();
		 } catch (err) {
		 	toastError(err);
		 }
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{departamentId
						? `${i18n.t("departamentModal.title.edit")}`
						: `${i18n.t("departamentModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={departament}
					enableReinitialize={true}
					validationSchema={DepartamentSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("departamentModal.form.name")}
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<div>
									<Field
										as={TextField}
										label={i18n.t("departamentModal.form.description")}
										type="description"
										multiline
										inputRef={descriptionRef}
										rows={4}
										fullWidth
										name="description"
										error={
											touched.description && Boolean(errors.description)
										}
										helperText={
											touched.description && errors.description
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<QueueSelect
									selectedQueueIds={selectedQueueIds}
									onChange={selectedIds => setSelectedQueueIds(selectedIds)}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("departamentModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{departamentId
										? `${i18n.t("departamentModal.buttons.okEdit")}`
										: `${i18n.t("departamentModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default DepartamentModal;
