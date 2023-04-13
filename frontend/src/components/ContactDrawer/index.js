import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import { Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@material-ui/core"
import { CancelOutlined, RemoveRedEye, DoneAll, ScheduleOutlined, RefreshOutlined } from "@material-ui/icons";
//import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";

import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { TagsContainer } from "../TagsContainer";
import WhatsAppLayout from '../WhatsappLayout';
import ModalImageContatc from "./ModalImage";
import CopyToClipboard from "../CopyToClipboard";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.background.default,
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.background.paper,
		flexDirection: "column",
		padding: "8px 0px 8px 8px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

	contactAvatar: {
		margin: 15,
		width: 160,
		height: 160,
		borderRadius: 10,
	},

	contactHeader: {
		display: "flex",
		padding: 8,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		"& > *": {
			margin: 4,
		},
	},

	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
	},
	contactExtraInfo: {
		marginTop: 4,
		padding: 6,
	},
	previewContainer: {
        height: "100%", 
        minHeight: "400px", 
        margin: 25,
        "@media (max-width: 720px)": {
            margin: 0,
            marginTop: 20
        }
    }
}));

function a11yProps(index) {
	return {
	  id: `simple-tab-${index}`,
	  'aria-controls': `simple-tabpanel-${index}`,
	};
}

function TabPanel(props) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`simple-tabpanel-${index}`}
		aria-labelledby={`simple-tab-${index}`}
		{...other}
	  >
		{value === index && (
		  <Box>
			{children}
		  </Box>
		)}
	  </div>
	);
}

function MessagesList({messages, setSelectedMessage, onCancelMessage}) {

	return (	
		<div>
			{
				
				messages.map(m => {
					return (
						<Paper style={{ padding: 5, marginTop: 5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<span>{new Date(m.inicialDate).toLocaleString()}</span>
							<div>
								{
									m.status === "sent" ? <DoneAll fontSize="small" style={{ color: "#2196f3", display: "flex", alignItems: "center" }} /> 
										: m.status === "scheduled" ? <ScheduleOutlined fontSize="small" style={{ color: "green", display: "flex", alignItems: "center" }} />
										: m.status === "failed" ? <CancelOutlined fontSize="small" style={{ color: "red", display: "flex", alignItems: "center" }} />
										: ""
								}
							</div>
							<div>
								<IconButton
									size="small"
									onClick={() => {
										setSelectedMessage(m)
									}}
								>
									<RemoveRedEye color="secondary" />
								</IconButton>
								{
									m.status === "scheduled" && (
										<IconButton
											size="small"
											onClick={() => {
												onCancelMessage(m.id)
											}}
										>
											<CancelOutlined color="secondary" />
										</IconButton>
									)
								}
								
							</div>
						</Paper>
					)
				})
			}
		</div>
	)
}

const ContactDrawer = ({ open, handleDrawerClose, contact, loading }) => {
	const classes = useStyles();

	const [modalOpen, setModalOpen] = useState(false);
	const [scheduledMessages, setScheduledMessages] = useState([]);
	const [tabValue, setTabValue] = useState(0);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [messagesLoading, setMessagesLoading] = useState(false)

	useEffect(() => {
		(async () => {
			setMessagesLoading(true)
			try {
				const { data } = await api.get(`/scheduleMessage/${contact.id}`);
				setScheduledMessages(data.scheduledMessages);
			} catch (err) {
				toast.error("Erro interno.")
			} finally {
				setMessagesLoading(false)
			}
		})()

		return setScheduledMessages([])
	}, [contact.id])

	const handleCancelMessage = async(messageId) => {
		try {
			await api.delete(`/scheduleMessage/${messageId}`)
			const messageIndex = scheduledMessages.findIndex(m => m.id === +messageId)
			if (messageIndex !== -1) {
				scheduledMessages.splice(messageIndex, 1);
			}
			toast.success("Mensagem cancelada")
			return setScheduledMessages([...scheduledMessages])
		} catch (err) {
			toastError(err)
		}
	}

	const refreshMessages = async() => {
		setMessagesLoading(true)
		try {
			const { data } = await api.get(`/scheduleMessage/${contact.id}`);
			setScheduledMessages(data.scheduledMessages);
		} catch (err) {
			toast.error("Erro interno.")
		} finally {
			setMessagesLoading(false)
		}
	}

	const allSheduledMessages = scheduledMessages.filter(m => m.status === "scheduled")
	const allFailedAndSentMessages = scheduledMessages.filter(m => m.status !== "scheduled")

	return (
		<>
		<Dialog
				open={selectedMessage}
				onClose={() => {setSelectedMessage(null)}}
				scroll="paper"
			>   
				<DialogTitle id="form-dialog-title">
					{i18n.t("campaignModal.title.preview")+":"}
				</DialogTitle>
				<DialogContent style={{ padding: 0, minHeight: "400px"}}>
					<Box className={classes.previewContainer}>
						<WhatsAppLayout 
							messages={[{id: 0, value: selectedMessage?.body, type: "text"}]}
							order={[0]}
							
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={()=>{setSelectedMessage(null)}}
						variant="outlined"
					>
						{i18n.t("campaignModal.buttons.close")}
					</Button>
				</DialogActions>
		</Dialog>
		<Drawer
			className={classes.drawer}
			variant="persistent"
			anchor="right"
			open={open}
			PaperProps={{ style: { position: "absolute" } }}
			BackdropProps={{ style: { position: "absolute" } }}
			ModalProps={{
				container: document.getElementById("drawer-container"),
				style: { position: "absolute" },
			}}
			classes={{
				paper: classes.drawerPaper,
			}}
		>
			<div className={classes.header}>
				<IconButton
					color="primary"
					onClick={handleDrawerClose}>
					<CloseIcon />
				</IconButton>
				<Typography style={{ justifySelf: "center" }}>
					{i18n.t("contactDrawer.header")}
				</Typography>
			</div>
			{loading ? (
				<ContactDrawerSkeleton classes={classes} />
			) : (
				<div className={classes.content}>
					<Paper square variant="outlined" className={classes.contactHeader}>
						<ModalImageContatc imageUrl={contact.profilePicUrl} />
						<Typography>
							{contact.name}
							<CopyToClipboard content={contact.name} color="secondary" />
							</Typography>
						<Typography>
							<Link href={`tel:${contact.number}`}>{contact.number}</Link>
							<CopyToClipboard content={contact.number} color="secondary" />
						</Typography>
						{contact.email && (
							<Typography>
								<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
								<CopyToClipboard content={contact.email} color="secondary" />
							</Typography>
						)}
						<Button
							variant="outlined"
							color="primary"
							onClick={() => setModalOpen(true)}
						>
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
					</Paper>
					<TagsContainer contact={contact} className={classes.contactTags} />
					<Paper square variant="outlined" className={classes.contactDetails}>
						<ContactModal
							open={modalOpen}
							onClose={() => setModalOpen(false)}
							contactId={contact.id}
						></ContactModal>
						<Typography variant="subtitle1">
							{i18n.t("contactDrawer.extraInfo")}
						</Typography>
						{contact?.extraInfo?.map(info => (
							<Paper
								key={info.id}
								square
								variant="outlined"
								className={classes.contactExtraInfo}
							>
								<InputLabel>
									{info.name}
									<CopyToClipboard content={info.value} color="secondary" />
								</InputLabel>
								<Typography component="div" noWrap style={{ paddingTop: 2 }}>
									<MarkdownWrapper>{info.value}</MarkdownWrapper>
								</Typography>
							</Paper>
						))}
					</Paper>
					<div style={{ marginTop: 20 }}>
						<Typography variant="subtitle1">
							Mensagens agendadas:
						</Typography>
						<Paper square style={{ display: "flex", justifyContent: "left", marginTop: 20 }}>
							<Tabs 
								value={tabValue} 
								onChange={(event, newValue) => setTabValue(newValue)} 
								aria-label="simple tabs example" 
								textColor="secondary"
								indicatorColor="secondary"
								variant="fullWidth"
							>
								<Tab label="Agendadas" {...a11yProps(0)} style={{width: 10}} />
								<Tab label="Finalizadas" {...a11yProps(1)} />
							</Tabs>
						</Paper>
						<TabPanel value={tabValue} index={0} style={{ padding: 0 }}>
							 <MessagesList messages={allSheduledMessages || []} setSelectedMessage={setSelectedMessage} onCancelMessage={handleCancelMessage} />
						</TabPanel>
						<TabPanel value={tabValue} index={1}>
							<MessagesList messages={allFailedAndSentMessages || []} setSelectedMessage={setSelectedMessage} onCancelMessage={() => {}} />
						</TabPanel>
					</div>
					<div style={{ marginTop: 20, width: "100%", display: "flex", justifyContent: "center" }}>
						<IconButton
							size="small"
							onClick={() => {
								refreshMessages()
							}}
						>
							{	messagesLoading ? 
								<CircularProgress color="secondary" size={20}/> 
								:
								<RefreshOutlined color="secondary" />
							}
						</IconButton>
					</div>
				
				</div>
			)}
		</Drawer>
		</>
	);
};

export default ContactDrawer;
