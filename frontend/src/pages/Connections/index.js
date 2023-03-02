import React, { useState, useCallback, useContext, useEffect, useReducer } from "react";
//import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Table,
	TableHead,
	Paper,
	Tooltip,
	Typography,
	CircularProgress,
	Tabs,
	Tab
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	//DeleteOutline,
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import QrCodeApiModal from "../../components/QrCodeApiModal";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		marginTop: -3,
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	tabContainer: {
		margin: theme.spacing(1),
		marginBottom: 0,
		zIndex: 9,
		borderBottom: "none",
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},
}));

function a11yProps(index) {
	return {
	  id: `simple-tab-${index}`,
	  'aria-controls': `simple-tabpanel-${index}`,
	};
}

function TabPanel(props) {
	const { children, value, index, ...other } = props;
	const classes = useStyles()
	return (
	  <Paper className={classes.mainPaper} variant="outlined"
		role="tabpanel"
		hidden={value !== index}
		id={`simple-tabpanel-${index}`}
		aria-labelledby={`simple-tab-${index}`}
		{...other}
	  >
		{value === index && (
			<div style={{ marginTop: 15 }}>{children}</div>
		)}
	  </Paper>
	);
}

const CustomToolTip = ({ title, content, children }) => {
	const classes = useStyles();

	return (
		<Tooltip
			arrow
			classes={{
				tooltip: classes.tooltip,
				popper: classes.tooltipPopper,
			}}
			title={
				<React.Fragment>
					<Typography gutterBottom color="inherit">
						{title}
					</Typography>
					{content && <Typography>{content}</Typography>}
				</React.Fragment>
			}
		>
			{children}
		</Tooltip>
	);
};

const reducer = (state, action) => {
	if (action.type === "LOAD_WHATSAPPS") {
		const whatsApps = action.payload;

		return [...whatsApps];
	}

	if (action.type === "UPDATE_WHATSAPPS") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex] = whatsApp;
			return [...state];
		} else {
			return [whatsApp, ...state];
		}
	}

	if (action.type === "UPDATE_SESSION") {
		const whatsApp = action.payload;
		const whatsAppIndex = state.findIndex(s => s.id === whatsApp.id);

		if (whatsAppIndex !== -1) {
			state[whatsAppIndex].status = whatsApp.status;
			state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
			state[whatsAppIndex].qrcode = whatsApp.qrcode;
			state[whatsAppIndex].retries = whatsApp.retries;
			return [...state];
		} else {
			return [...state];
		}
	}

	if (action.type === "DELETE_WHATSAPPS") {
		const whatsAppId = action.payload;

		const whatsAppIndex = state.findIndex(s => s.id === whatsAppId);
		if (whatsAppIndex !== -1) {
			state.splice(whatsAppIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Connections = () => {
	const classes = useStyles();

	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsappsApi, dispatch] = useReducer(reducer, [])
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [tabValue, setTabValue] = useState(0)
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [qrApiModalOpen, setQrApiModalOpen] = useState(false);
	const [selectedWhatsAppApi, setSelectedWhatsAppApi] = useState(null);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		isApi: false,
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);

	useEffect(() => { 
		(async () => {
			const { data } = await api.get("/whatsappapi")
			dispatch({ type: "LOAD_WHATSAPPS", payload: data.whatsapps})
		})()
	}, [])

	useEffect(() => {
		const socket = openSocket();

		socket.on("whatsappapi-update", data => {
			if (data.action === "UPDATE_SESSION") {
				dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
			}
		});
	}, [])

	const handleStartWhatsAppSession = async whatsAppId => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async whatsAppId => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`, { isQrcode: true });
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, [setSelectedWhatsApp, setWhatsAppModalOpen]);

	const handleOpenQrModal = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleOpenQrApiModal = whatsappApi => {
		setSelectedWhatsAppApi(whatsappApi);
		setQrApiModalOpen(true);
	};

	const handleCloseQrApiModal = useCallback(() => {
		setSelectedWhatsAppApi(null)
		setQrApiModalOpen(false)
	}, [setQrApiModalOpen, setSelectedWhatsAppApi])

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, [setQrModalOpen, setSelectedWhatsApp]);

	const handleEditWhatsApp = whatsApp => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleApiReconect = async whatsappId => {
		api.put("/whatsappapisession/reconect", { id: whatsappId})
	}

	const handleOpenConfirmationModal = (action, whatsAppId, isApi) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId: whatsAppId,
				isApi
			});
		}

		/* if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		} */
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				if(confirmModalInfo.isApi) {
					await api.delete(`/whatsappapisession/desconect/${confirmModalInfo.whatsAppId}`);
					return
				}
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		/* if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		} */

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = whatsApp => {
		return (
			<>
				{whatsApp.status === "qrcode" && (
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() =>{ whatsApp.sessionId ? handleOpenQrApiModal(whatsApp) : handleOpenQrModal(whatsApp)}}
					>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						{
							!whatsApp.sessionId &&
							<Button
								size="small"
								variant="outlined"
								color="primary"
								onClick={() => handleStartWhatsAppSession(whatsApp.id)}
							>
								{i18n.t("connections.buttons.tryAgain")}
							</Button>
						}
						{" "}
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => whatsApp.sessionId ? handleApiReconect(whatsApp.id) :  handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
						
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							onClick={() => {
								handleOpenConfirmationModal("disconnect", whatsApp.id, whatsApp.sessionId ? true : false);
							}}
						>
							{i18n.t("connections.buttons.disconnect")}
						</Button>
					)}
				{whatsApp.status === "OPENING" && (
					<Button size="small" variant="outlined" disabled color="default">
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</>
		);
	};

	const renderStatusToolTips = whatsApp => {
		return (
			<div className={classes.customTableCell}>
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<SignalCellularConnectedNoInternet0Bar color="secondary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<CircularProgress size={24} className={classes.buttonProgress} />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<CropFree />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<SignalCellular4Bar style={{ color: green[500] }} />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<SignalCellularConnectedNoInternet2Bar color="secondary" />
					</CustomToolTip>
				)}
			</div>
		);
	};
	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<QrCodeApiModal 
				open={qrApiModalOpen}
				onClose={handleCloseQrApiModal}
				whatsAppId={selectedWhatsAppApi?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("connections.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenWhatsAppModal}
					>
						{i18n.t("connections.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper variant="outlined" className={classes.tabContainer} square style={{ display: "flex", justifyContent: "left", marginTop: 20 }}>
				<Tabs 
					value={tabValue} 
					onChange={(event, newValue) => setTabValue(newValue)} 
					aria-label="simple tabs example" 
					textColor="primary"
					indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
				>
					<Tab label="Conexões" {...a11yProps(0)} />
					<Tab label="API's" {...a11yProps(1)} />
				</Tabs>
			</Paper>
			<TabPanel value={tabValue} index={0} style={{ padding: 0 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("connections.table.id")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.status")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.number")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.session")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.default")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsApps?.length > 0 &&
									whatsApps.map(whatsApp => (
										<TableRow key={whatsApp.id}>
											<TableCell align="center">
												{whatsApp.id}
											</TableCell>
											<TableCell align="center">
												{whatsApp.name}
											</TableCell>
											<TableCell align="center">
												{renderStatusToolTips(whatsApp)}
											</TableCell>
											<TableCell align="center">
												+{whatsApp.number}
											</TableCell>
											<TableCell align="center">
												{renderActionButtons(whatsApp)}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<div className={classes.customTableCell}>
														<CheckCircle style={{ color: green[500] }} />
													</div>
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
													disabled={whatsApp.status === "CONNECTED"}
												>
													<Edit color={whatsApp.status === "CONNECTED"? "black" : "secondary" } />
												</IconButton>

												{/* <IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline color="secondary" />
												</IconButton> */}
											</TableCell>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</TabPanel>
			<TabPanel value={tabValue} index={1} style={{ padding: 0 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("connections.table.id")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.status")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.number")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.session")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center">
								{// i18n.t("connections.table.default")
								}
								API Key
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsappsApi?.length > 0 &&
									whatsappsApi.map(whatsApp => (
										<TableRow key={whatsApp.id}>
											<TableCell align="center">
												{whatsApp.id}
											</TableCell>
											<TableCell align="center">
												{whatsApp.name}
											</TableCell>
											<TableCell align="center">
												{renderStatusToolTips(whatsApp)}
											</TableCell>
											<TableCell align="center">
												+{whatsApp.number}
											</TableCell>
											<TableCell align="center">
												{renderActionButtons(whatsApp)}
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<div className={classes.customTableCell}>
														<CheckCircle style={{ color: green[500] }} />
													</div>
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
													disabled={whatsApp.status === "CONNECTED"}
												>
													<Edit color={whatsApp.status === "CONNECTED"? "black" : "secondary" } />
												</IconButton>

												{/* <IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline color="secondary" />
												</IconButton> */}
											</TableCell>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</TabPanel>
		</MainContainer>
	);
};

export default Connections;
