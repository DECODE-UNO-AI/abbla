import React, { useContext, useState } from "react"

import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import { Tabs, Tab, Box } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography";

import useTickets from "../../hooks/useTickets"

import { AuthContext } from "../../context/Auth/AuthContext";

import { i18n } from "../../translate/i18n";

import Chart from "./Chart"
import QueueChart from "./QueueChart"
import DepartamentChart from "./DepartamentChart"

const useStyles = makeStyles(theme => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	fixedHeightPaper: {
		padding: theme.spacing(2),
		position: "relative",
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
	},
	customFixedHeightPaper: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		minHeight: 120,
	},
	customFixedHeightPaperLg: {
		padding: theme.spacing(2),
		display: "flex",
		overflow: "auto",
		flexDirection: "column",
		height: "100%",
	},
}))

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
		  <Box div={3} style={{ marginTop: -5, height: "auto" }}>
			<div>{children}</div>
		  </Box>
		)}
	  </div>
	);
}

const Dashboard = () => {
	const classes = useStyles()
	const [tabValue, setTabValue] = useState(0)
	const { user } = useContext(AuthContext);
	var userQueueIds = [];

	if (user.queues && user.queues.length > 0) {
		userQueueIds = user.queues.map(q => q.id);
	}

	const GetTickets = (status, showAll, withUnreadMessages) => {

		const { allTicketsCount } = useTickets({
			status: status,
			showAll: showAll,
			withUnreadMessages: withUnreadMessages,
			queueIds: JSON.stringify(userQueueIds)
		});
		return allTicketsCount;
	}

	return (
		<div>
			<Container maxWidth="lg" className={classes.container}>
				<Grid container spacing={3}>
					<Grid item xs={4}>
						<Paper className={classes.customFixedHeightPaper} style={{ overflow: "hidden" }}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.inAttendance.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("open", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={4}>
						<Paper className={classes.customFixedHeightPaper} style={{ overflow: "hidden" }}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.waiting.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("pending", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
					<Grid item xs={4}>
						<Paper className={classes.customFixedHeightPaper} style={{ overflow: "hidden" }}>
							<Typography component="h3" variant="h6" color="primary" paragraph>
								{i18n.t("dashboard.messages.closed.title")}
							</Typography>
							<Grid item>
								<Typography component="h1" variant="h4">
									{GetTickets("closed", "true", "false")}
								</Typography>
							</Grid>
						</Paper>
					</Grid>
				</Grid>
				<Paper square style={{ display: "flex", justifyContent: "left", marginTop: 20 }}>
					<Tabs 
						value={tabValue} 
						onChange={(event, newValue) => setTabValue(newValue)} 
						aria-label="simple tabs example" 
						textColor="primary"
						indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
					>
						<Tab label="Hoje" {...a11yProps(0)} />
						<Tab label="Setores" {...a11yProps(1)} />
						{
							user?.profile === "admin" || user?.profile === "supervisor" ?
							<Tab label="Departamentos" {...a11yProps(2)} /> : ""
						}
					</Tabs>
				</Paper>
				<TabPanel value={tabValue} index={0} style={{ padding: 0 }}>
					<Paper className={classes.fixedHeightPaper} >
						<Chart />
					</Paper>
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<Paper className={classes.fixedHeightPaper} >
						<QueueChart userQueues={user.queues} />
					</Paper>
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					<Paper className={classes.fixedHeightPaper} >
						<DepartamentChart userDepartaments={user.departaments} userQueues={user.queues} isAdmin={user?.profile === "admin"}/>
					</Paper>
				</TabPanel>
			</Container>
		</div>
	)
}

export default Dashboard