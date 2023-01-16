import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import {
	Formik,
	Form,
	Field
} from "formik";
import { toast } from "react-toastify";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Select,
	InputLabel,
	makeStyles,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton
} from '@material-ui/core';

import { 
	Visibility, 
	VisibilityOff 
} from '@material-ui/icons';

import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import DepartamentSelect from "../DepartamentSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper,
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
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
	whatsappNumber: Yup.string().min(8, "Too Short!").max(50, "Too Long!").matches(/^\d+$/, i18n.t("userModal.form.numberFormatError")),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		startWork: "",
		whatsappNumber: "",
		endWork: "",
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [selectedDepartamentIds, setSelectedDepartamentsIds] = useState([]);
	const [selectedDepartaments, setSelectedDepartaments] = useState([])
	const [showPassword, setShowPassword] = useState(false);
	const [showNotication, setShowNotification] = useState("");
	const [whatsappId, setWhatsappId] = useState(false);
	const [isSupervisor, setIsSupervisor] = useState(false);
	const { loading, whatsApps } = useWhatsApps();
	const startWorkRef = useRef();
	const endWorkRef = useRef();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				const userDepartamentIds = data.departaments?.map(dep => dep.id)
				setSelectedDepartamentsIds(userDepartamentIds)
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
				setShowNotification(data.notificationSound)
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	useEffect(() => {
		if (user.profile === "supervisor") {
			setIsSupervisor(true)
		}

		return () => setIsSupervisor(false)
	}, [user.profile])

	useEffect(() => {
		let newQueues = []
		selectedDepartaments.map((dep) => dep.queues.map((q) =>  newQueues = [...newQueues, q.id]))
		const newQueuesUnique = [...new Set(newQueues)]
		setSelectedQueueIds(newQueuesUnique)

		return () => setSelectedQueueIds([])
	}, [selectedDepartaments])

	const handleOnProfileChange = (e) => {
		if (e.target.value === "supervisor") {
			setIsSupervisor(true)
		} else {
			setIsSupervisor(false)
		}
	}

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};


	const handleSaveUser = async values => {
		const userData = { ...values, whatsappId, notificationSound: showNotication, queueIds: selectedQueueIds, departamentIds: selectedDepartamentIds};
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										name="password"
										variant="outlined"
										margin="dense"
										label={i18n.t("userModal.form.password")}
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										type={showPassword ? 'text' : 'password'}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														aria-label="toggle password visibility"
														onClick={() => setShowPassword((e) => !e)}
													>
														{showPassword ? <VisibilityOff color="secondary" /> : <Visibility color="secondary" />}
													</IconButton>
												</InputAdornment>
											)
										}}
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
										style={{ marginRight: 0}}
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.profile")}
													</InputLabel>

													<Field
														as={Select}
														inputProps={{ onChange: handleOnProfileChange}}
														label={i18n.t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">{i18n.t("userModal.form.admin")}</MenuItem>
														<MenuItem value="user">{i18n.t("userModal.form.user")}</MenuItem>
														<MenuItem value="supervisor">{i18n.t("userModal.form.supervisor")}</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.whatsappNumber")}
										placeholder={"Ex: 5513912344321"}
										error={touched.whatsappNumber && Boolean(errors.whatsappNumber)}
										helperText={touched.whatsappNumber && errors.whatsappNumber}
										name="whatsappNumber"
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								{
									isSupervisor ? 
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editDepartaments"
										yes={() => (
											<DepartamentSelect
												selectedDepartamentIds={selectedDepartamentIds}
												onChange={values => setSelectedDepartamentsIds(values)}
												departamentsSeleted={setSelectedDepartaments}
											/>
										)}
									/> : ""
								}
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
											isDisabled={selectedDepartamentIds.length > 0}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (!loading &&
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>{i18n.t("userModal.form.whatsapp")}</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}
											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (!loading &&
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>{"Notificações"}</InputLabel>
											<Field
												as={Select}
												value={showNotication}
												onChange={(e) => setShowNotification(e.target.value)}
												label={"Notificações"}
											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												<MenuItem key={true} value={true}>Ativadas</MenuItem>
												<MenuItem key={false} value={false}>Desativadas</MenuItem>
												
											</Field>
										</FormControl>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (!loading &&
										<form className={classes.container} noValidate>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.startWork")}
												type="time"
												ampm={false}
												defaultValue="00:00"
												inputRef={startWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="startWork"
												error={
													touched.startWork && Boolean(errors.startWork)
												}
												helperText={
													touched.startWork && errors.startWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.endWork")}
												type="time"
												ampm={false}
												defaultValue="23:59"
												inputRef={endWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="endWork"
												error={
													touched.endWork && Boolean(errors.endWork)
												}
												helperText={
													touched.endWork && errors.endWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
												style={{ marginRight: 0}}
											/>
										</form>
									)}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
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

export default UserModal;