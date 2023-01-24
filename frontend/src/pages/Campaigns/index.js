import React, { useState, useCallback, useContext, useEffect, useReducer } from "react";
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
} from "@material-ui/core";
import {
	Edit,
	CheckCircle,
	SignalCellularConnectedNoInternet2Bar,
	SignalCellularConnectedNoInternet0Bar,
	SignalCellular4Bar,
	CropFree,
	DeleteOutline,
	PauseCircleOutline,
	PlayArrowOutlined,
	CancelOutlined
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import CampaignModal from "../../components/CampaignModal";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
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

	const handleEditCampaign = (campaign) => {
		setSelectedCampaign(campaign);
		setModalOpen(true);
	};

	const handleDeleteCampaign = (campaign) => {
		setSelectedCampaign(campaign)
        setConfirmModalOpen(true);
	}

	const handleOnDeleteCampaign = async (campaign) => {
		try {
			await api.delete(`/campaigns/${campaign.id}`);
			toast.success(i18n.t("departaments.notifications.departamentDeleted"));
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
				`${i18n.t("departaments.confirmationModal.deleteTitle")} ${
					selectedCampaign.name
				}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleOnDeleteCampaign(selectedCampaign)}
			>
				{// i18n.t("departaments.confirmationModal.deleteMessage")
				}Tem certeza que deseja excluir a campanha? Todos os contatos da campanha e mensagens agendadas serão excluidas.
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
					Nome
				</TableCell>
				<TableCell align="center">
					Programação
				</TableCell>
				<TableCell align="center">
					Status
				</TableCell>
				<TableCell align="center">
					Actions
				</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {campaigns?.map((campaign) => (
                <TableRow key={campaign.id}>
					<TableCell align="left">{campaign.id}</TableCell>
                  <TableCell align="left">{campaign.name}</TableCell>
                  <TableCell align="center">
                    <div className={classes.customTableCell}>
                      <Typography
                        style={{ width: 200, align: "center" }}
                        noWrap
                        variant="body2"
                      >
                        {campaign.inicialDate}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    {campaign.status}
                  </TableCell>
                  <TableCell align="center">
					{
					  ["canceled", "paused"].includes(campaign.status) ? 
						  <IconButton
							  size="small"
							  onClick={() => {
								  handleEditCampaign(campaign);
							  }}
						  >
							  <PlayArrowOutlined color="secondary" />
						  </IconButton> : ""
					}
					{
						["canceled", "scheduled"].includes(campaign.status) ? 
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
						["processing", "timeout"].includes(campaign.status) ?
							<IconButton
								size="small"
								onClick={() => {
									handleDeleteCampaign(campaign)
								}}
							>
								<PauseCircleOutline color="secondary" />
							</IconButton> : ""
					}
					{
						["processing", "timeout"].includes(campaign.status) ?
							<IconButton
								size="small"
								onClick={() => {
									handleDeleteCampaign(campaign)
								}}
							>
								<CancelOutlined color="secondary" />
							</IconButton> : ""
					}
					{
						["finished", "paused", "scheduled", "timeout", "canceled"].includes(campaign.status) ?
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
