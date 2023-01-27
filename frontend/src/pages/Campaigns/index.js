import React, { useState, useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
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
} from "@material-ui/core";
import {
	Edit,
	DeleteOutline,
	PauseCircleOutline,
	PauseCircleFilled,
	PlayArrowOutlined,
	CancelOutlined,
	ScheduleOutlined,
	CheckCircle,
	Block,
	TimerOff,
	Report,
	PlayArrow
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import CampaignModal from "../../components/CampaignModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";


const CustomToolTip = ({ title, content, children }) => {

	return (
		<Tooltip
			arrow
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


const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const reducer = (state, action) => {
	if (action.type === "LOAD_CAMPAIGNS") {
		const campaigns = action.payload;
		const newCampaigns = [];
		campaigns.forEach((departament) => {
		  const departamentIndex = state.findIndex((q) => q.id === departament.id);
		  if (departamentIndex !== -1) {
			state[departamentIndex] = departament;
		  } else {
			newCampaigns.push(departament);
		  }
		});
		return [...state, ...newCampaigns];
	}
	if (action.type === "UPDATE_CAMPAIGNS") {
		const campaign = action.payload;
		const campaignIndex = state.findIndex((u) => u.id === campaign.id);
		if (campaignIndex !== -1) {
		  state[campaignIndex] = campaign;
		  return [...state];
		} else {
		  return [campaign, ...state];
		}
	  }
	
	  if (action.type === "DELETE_CAMPAIGNS") {
		const campaignId = action.payload;
		const campaignIndex = state.findIndex((q) => q.id === +campaignId);
		if (campaignIndex !== -1) {
		  state.splice(campaignIndex, 1);
		}
		return [...state];
	  }
	
	  if (action.type === "RESET") {
		return [];
	  }
}


const Campaigns = () => {
	const classes = useStyles();
	const [modalOpen, setModalOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [campaigns, dispatch] = useReducer(reducer, []);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [selectedCampaign, setSelectedCampaign] = useState(null)

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
			  const { data } = await api.get("/campaigns");
			  dispatch({ type: "LOAD_CAMPAIGNS", payload: data });
			  setLoading(false);
			} catch (err) {
			  toastError(err);
			  setLoading(false);
			}
		  })();
	}, [])

	useEffect(() => {
		const socket = openSocket();
	
		socket.on("campaigns", (data) => {
		  if (data.action === "update" || data.action === "create") {
			dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.campaign });
		  }
	
		  if (data.action === "delete") {
			dispatch({ type: "DELETE_CAMPAIGNS", payload: data.campaignId });
		  }
		});
	
		return () => {
		  socket.disconnect();
		};
	  }, []);

	const handleEditCampaign = (campaign) => {
		setSelectedCampaign(campaign);
		setModalOpen(true);
	};

	const handleDeleteCampaign = (campaign) => {
		setSelectedCampaign(campaign)
        setConfirmModalOpen(true);
	}

	const handlePauseCampaign = async(campaign) => {
		try {
			await api.put(`/campaigns/pause/${campaign.id}`);
			toast.success(i18n.t("campaigns.notifications.campaignPaused"));
		} catch (err) {
			toastError(err);
		}
	}

	const handlePlayCampaign = async(campaign) => {
		try {
			await api.put(`/campaigns/play/${campaign.id}`);
			toast.success(i18n.t("campaigns.notifications.campaignStarted"));
		} catch (err) {
			toastError(err);
		}
	}

	const handleCancelCampaign = async(campaign) => {
		try {
			await api.put(`/campaigns/cancel/${campaign.id}`);
			toast.success(i18n.t("campaigns.notifications.campaignCanceled"));
		} catch (err) {
			toastError(err);
		}
	}

	const handleOnDeleteCampaign = async (campaign) => {
		try {
			await api.delete(`/campaigns/${campaign.id}`);
			toast.success(i18n.t("campaigns.notifications.campaignDeleted"));
		} catch (err) {
			toastError(err);
		}
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedCampaign(null);
	};

	const handleOnCloseModal = () => {
		setModalOpen(false)
		setSelectedCampaign(null)
	}

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedCampaign &&
				`${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
					selectedCampaign.name
				}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleOnDeleteCampaign(selectedCampaign)}
			>
				{i18n.t("campaigns.confirmationModal.deleteMessage")}
				
			</ConfirmationModal>
            <CampaignModal open={modalOpen} onClose={handleOnCloseModal} campaignId={selectedCampaign?.id} />
			<MainHeader>
                <Title>{i18n.t("campaigns.title")}</Title>
                <MainHeaderButtonsWrapper>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalOpen(true)}
                >
                    {i18n.t("campaigns.buttons.add")}
                </Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="left">
								ID
							</TableCell>
							<TableCell align="left">
								{i18n.t("campaigns.table.name")}
							</TableCell>
							<TableCell align="left">
								{i18n.t("campaigns.table.inicialDate")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.status")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.details")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<>
						{campaigns?.map((campaign) => (
							<TableRow key={campaign.id}>
								<TableCell align="left">{campaign.id}</TableCell>
								<TableCell align="left">{campaign.name}</TableCell>
								<TableCell align="left">{new Date(campaign.inicialDate).toLocaleString()}</TableCell>
								<TableCell align="center">
									{
										campaign.status === "scheduled" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.scheduled")}
											>
												<ScheduleOutlined color="secondary" size={24} />
											</CustomToolTip> 
											:
											campaign.status === "processing" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.processing")}
											>
												<PlayArrow color="secondary" />
											</CustomToolTip> 
											:
											campaign.status === "paused" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.paused")}
											>
												<PauseCircleFilled color="secondary" />
											</CustomToolTip> 
											:
											campaign.status === "canceled" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.canceled")}
											>
												<Block color="secondary" />
											</CustomToolTip> 
											:
											campaign.status === "finished" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.finished")}
											>
												<CheckCircle color="secondary" />
											</CustomToolTip> 
											:
											campaign.status === "failed" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.failed")}
											>
												<Report color="secondary" />
											</CustomToolTip> :
											campaign.status === "timeout" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.timeout")}
											>
												<TimerOff color="secondary" />
											</CustomToolTip> : ""
											
									}
								</TableCell>
								<TableCell align="center">
									<Link to={`campaign/${campaign.id}`} style={{ textDecoration: "none"}}>
										<Button
											variant="contained"
											color="secondary"
										>
											{i18n.t("campaigns.table.details")}
										</Button>
									</Link>
								</TableCell>
								<TableCell align="right">
									{
									["paused"].includes(campaign.status) ? 
										<IconButton
											size="small"
											onClick={() => {
												handlePlayCampaign(campaign);
											}}
										>
											<PlayArrowOutlined color="secondary" />
										</IconButton> : ""
									}
									{
										["processing", "timeout", "scheduled"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handlePauseCampaign(campaign)
												}}
											>
												<PauseCircleOutline color="secondary" />
											</IconButton> : ""
									}
									{
										["processing", "timeout", "scheduled"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handleCancelCampaign(campaign)
												}}
											>
												<CancelOutlined color="secondary" />
											</IconButton> : ""
									}
									{
										["scheduled"].includes(campaign.status) ? 
											<IconButton
												size="small"
												onClick={() => {
													handleEditCampaign(campaign);
												}}
											>
												<Edit color="secondary" />
											</IconButton> : ""
									}
									{
										["finished", "paused", "scheduled", "timeout", "canceled", "failed"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handleDeleteCampaign(campaign)
												}}
											>
												<DeleteOutline color="secondary" />
											</IconButton> : ""
									}
								</TableCell>
							</TableRow>
						))}
						{loading && <TableRowSkeleton columns={5} />}
						</>
					</TableBody>
				</Table>
            </Paper>
		</MainContainer>
	);
};

export default Campaigns;
