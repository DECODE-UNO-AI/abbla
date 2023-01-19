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
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
    slider: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},
    messageTab: {
        "& > div": {
            padding: 0
        }
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

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`scrollable-auto-tabpanel-${index}`}
          aria-labelledby={`scrollable-auto-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box p={3}>
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
}

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const CampaignModal = ({ open, onClose, campaignId }) => {
	const classes = useStyles();

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

	return (

			<Dialog
				open={true}
				onClose={()=> {}}
				fullWidth
                style={{ widht: 800 }}
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{true
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={{}}
					enableReinitialize={true}
					// validationSchema={()=> {}}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							// handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers style={{ widht: 800}}>
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
                                    <AppBar position="static" color="default">
                                        <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="scrollable auto tabs example"
                                        >
                                        <Tab label="Item One" {...a11yProps(0)} />
                                        <Tab label="Item Two" {...a11yProps(1)} />
                                        <Tab label="Item Three" {...a11yProps(2)} />
                                        <Tab label="Item Four" {...a11yProps(3)} />
                                        <Tab label="Item Five" {...a11yProps(4)} />
                                        </Tabs>
                                    </AppBar>
                                    <TabPanel value={value} index={0} className={classes.messageTab}>
                                        <TextField
                                            style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="standard"
                                            margin="none"
                                            
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            // value={""}
                                            // label={`${i18n.t("settingModal.form.messageLabel")}`}
                                            name="messageOnDisconnect"
                                            onChange={(e) => console.log(e.target.value)}
                                        />
                                    </TabPanel>
                                    <TabPanel value={value} index={1}>
                                        Item Two
                                    </TabPanel>
                                    <TabPanel value={value} index={2}>
                                        Item Three
                                    </TabPanel>
                                    <TabPanel value={value} index={3}>
                                        Item Four
                                    </TabPanel>
                                    <TabPanel value={value} index={4}>
                                        Item Five
                                    </TabPanel>
                                </div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={()=> {}}
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
									{campaignId
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
	);
};

export default CampaignModal;