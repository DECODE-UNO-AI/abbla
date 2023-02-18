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
	TextField,
	InputAdornment,
	Box,
	Badge,
} from "@material-ui/core";
import {
	Edit,
	FolderOutlined,
	Folder,
	RepeatOneOutlined,
	PauseCircleOutline,
	PauseCircleFilled,
	PlayArrowOutlined,
	CancelOutlined,
	ScheduleOutlined,
	CheckCircle,
	Block,
	TimerOff,
	Report,
	PlayArrow,
	RemoveRedEye,
	Search,
	Tune
} from "@material-ui/icons";
import { Cascader } from 'antd';

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
import useWhatsApps from "../../hooks/useWhatsApps";


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
	filterInconContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: 5,
		marginLeft: 25,
		cursor: "pointer"
	},
	searchFilterContainer: {
		width: "100%", 
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		marginBottom: 20
	}
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

const getWhatsAppName = (whatsapps, id) => {
	const whatsIndex = whatsapps.findIndex((w) => w.id === id)
	if(whatsIndex === -1){
		return "-"
	}
	return whatsapps[whatsIndex].name
}

const Campaigns = () => {
	const classes = useStyles();
	const [modalOpen, setModalOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [campaigns, dispatch] = useReducer(reducer, []);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [selectedCampaign, setSelectedCampaign] = useState(null)
	const [visualizeModal, setVisualizeModal] = useState(false)
	const [filterOptions, setFilterOptions] = useState([])
	const [searchParam, setSearchParam] = useState("")

	const { whatsApps } = useWhatsApps()

	useEffect(() => {
		dispatch({ type: "RESET" });
	  }, [filterOptions, searchParam]);

	useEffect(() => {
		(async () => {
			setLoading(true);
			let filterData = {};
			if (filterOptions.length > 0) {
				filterData = filterOptions.reduce((acc, item) => {
					if (item.length > 1) {
					const key = item[0];
					const value = item[1];
					if (acc[key]) {
						acc[key].push(value);
					} else {
						acc[key] = [value];
					}
					} else {
						const key = item[0]
						acc[key] = []
					}
					return acc;
				}, {});
			}
			try {
			  const { data } = await api.get("/campaigns", {
				params: { searchParam, filterOptions: filterData }
			  });
			  dispatch({ type: "LOAD_CAMPAIGNS", payload: data });
			  setLoading(false);
			} catch (err) {
			  toastError(err);
			  setLoading(false);
			}
		  })();
	}, [searchParam, filterOptions])

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

	  const cascaderOptions = [
		{
		  label: 'Status',
		  value: 'status',
		  children: [
				{
					label: `Processando`,
					value: "processing",
				},
				{
					label: `Agendado`,
					value: "scheduled",
				},
				{
					label: `Finalizado`,
					value: "finished",
				},
				{
					label: `Cancelado`,
					value: "canceled",
				},
				{
					label: `Arquivado`,
					value: "archived",
				},
				{
					label: `Pausado`,
					value: "paused",
				},
				{
					label: `Falhou`,
					value: "failed",
				},	
			],
		},
		{
		  label: 'Conexão',
		  value: 'conn',
		  children: whatsApps.map(w => {
			return { label: w.name, value: w.id}
		  })
			
		},
	]

	const handleEditCampaign = (campaign) => {
		setVisualizeModal(false)
		setSelectedCampaign(campaign);
		setModalOpen(true);
	}

	const handleOnVisualize = (campaign) => {
		setVisualizeModal(true)
		setSelectedCampaign(campaign);
		setModalOpen(true);
	}

	const handleArchiveCampaign = (campaign) => {
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

	const handleOnArchiveCampaign = async (campaign) => {
		try {
			await api.put(`/campaigns/archive/${campaign.id}`);
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
				`${i18n.t("campaigns.confirmationModal.archiveTitle")} ${
					selectedCampaign.name
				}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleOnArchiveCampaign(selectedCampaign)}
			>
				{i18n.t("campaigns.confirmationModal.archiveMessage")}
				
			</ConfirmationModal>
            <CampaignModal open={modalOpen} onClose={handleOnCloseModal} campaignId={selectedCampaign?.id} visualize={visualizeModal} />
			<MainHeader>
                <Title>{i18n.t("campaigns.title")}</Title>
                <MainHeaderButtonsWrapper>
					
					<Button
						variant="contained"
						color="primary"
						onClick={() => { 
							setVisualizeModal(false)
							setModalOpen(true)
						}}
					>
						{i18n.t("campaigns.buttons.add")}
					</Button>
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
				<Box className={classes.searchFilterContainer}>
					<TextField
						placeholder={i18n.t("contacts.searchPlaceholder")}
						type="search"
						value={searchParam}
						onChange={(e) => setSearchParam(e.target.value)}
						InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search color="primary" />
							</InputAdornment>
						),
						}}
					/>
					<Cascader
						style={{
							// width: '100%',
							marginBottom: 20
						}}
						options={cascaderOptions}
						onChange={(e)=> setFilterOptions(e)}
						multiple
						maxTagCount="responsive"
						placeholder="Filtros"
						children={
							<Badge badgeContent={filterOptions.length} color="secondary">
								<Paper className={classes.filterInconContainer}>
									<Tune className={classes.icon}/>
								</Paper>
							</Badge>
						}
					/>
				</Box>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="left">
								ID
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.connection")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.createdAt")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.inicialDate")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.delay")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.total")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.sent")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.failed")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("campaigns.table.canceled")}
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
								<TableCell align="center">{campaign.id}</TableCell>
								<TableCell align="left">{campaign.name}</TableCell>
								<TableCell align="center">{getWhatsAppName(whatsApps, campaign.whatsappId)}</TableCell>
								<TableCell align="left">{new Date(campaign.createdAt).toLocaleString()}</TableCell>
								<TableCell align="left">{new Date(campaign.inicialDate).toLocaleString()}</TableCell>
								<TableCell align="center">{campaign.delay.split("-")[1]} seg</TableCell>
								<TableCell align="center">
									<span style={{ fontWeight: "bold", color: "#45a249"}}>
										{campaign.contactsSent + campaign.contactsFailed}/{campaign.contactsNumber}
									</span>
								</TableCell>
								<TableCell align="center"><span style={{ fontWeight: "bold", color: "#6961fd"}}>{campaign.contactsSent}</span></TableCell>
								<TableCell align="center"><span style={{ fontWeight: "bold", color: "#ff0038"}}>{campaign.contactsFailed}</span></TableCell>
								<TableCell align="center">
									{
										["canceled", "failed"].includes(campaign.status) ?
										<span style={{ fontWeight: "bold", color: "#979797"}}>
											{ campaign.contactsNumber - campaign.contactsSent + campaign.contactsFailed}
										</span>
										:
										<span style={{ fontWeight: "bold", color: "#979797"}}>
											0
										</span>
									}
								</TableCell>
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
											campaign.status === "archived" ?
											<CustomToolTip
											title={i18n.t("campaigns.toolTips.title.archived")}
											>
												<Folder color="secondary" />
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
										["finished", "archived", "failed", "canceled"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handleEditCampaign(campaign)
												}}
											>
												<RepeatOneOutlined color="secondary" />
											</IconButton> : ""
									}
									{
										["finished", "canceled", "failed", "processing", "timeout", "paused"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handleOnVisualize(campaign)
												}}
											>
												<RemoveRedEye color="secondary" />
											</IconButton> : ""
									}
									{
										["finished", "canceled", "failed"].includes(campaign.status) ?
											<IconButton
												size="small"
												onClick={() => {
													handleArchiveCampaign(campaign)
												}}
											>
												<FolderOutlined color="secondary" />
											</IconButton> : ""
									}
								</TableCell>
							</TableRow>
						))}
						{loading && <TableRowSkeleton columns={13} />}
						</>
					</TableBody>
				</Table>
            </Paper>
		</MainContainer>
	);
};

export default Campaigns;
