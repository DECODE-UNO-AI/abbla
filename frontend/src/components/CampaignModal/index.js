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
    Slider,
	Select,
	InputLabel,
	makeStyles,
	MenuItem,
	FormControl,
	TextField,
	InputAdornment,
	IconButton,
    Card,
    CardContent
} from '@material-ui/core';

import { 
	Visibility, 
	VisibilityOff,
    SpeedOutlined
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
import SpeedMessageCards from "../SpeedMessageCards";

const useStyles = makeStyles(theme => ({
    slider: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    messageTab: {
        "& > div": {
            padding: 0
        }
    },
    dialog: {
        "& > div > div": {
            maxWidth: 1200
        }
    },
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
	},
    box: {
        marginBottom: 30
    }
}));

const marks = [
    {
        value: 0,
        label: '00:00',
    },
    {
        value: 4,
        label: '04:00',
    },
    {
        value: 8,
        label: '08:00',
    },
    {
        value: 12,
        label: '12:00',
    },
    {
        value: 16,
        label: '16:00',
    },
    {
        value: 20,
        label: '20:00',
    },
    {
        value: 24,
        label: '23:59',
    },
  ];

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
    const [value2, setValue2] = React.useState([0, 24]);

  const handleChange2 = (event, newValue2) => {
    setValue2(newValue2);
  };

    const handleChange = (event, newValue) => {
    
      setValue(newValue);
    };

	return (

			<Dialog
				open={true}
				onClose={()=> {}}
				className={classes.dialog}
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
							<DialogContent dividers style={{ widht: 800, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                <Box sx={{ width: "100%" }}  className={classes.box}>
                                    <Typography variant="h6">
                                        {/* {i18n.t("campaigns.title")} */} Horário da campanha
                                    </Typography>
                                    <div style={{ paddingLeft: 15, paddingRight: 15}}>
                                        <Field 
                                            as={Slider}
                                            getAriaLabel={() => 'Hours'}
                                            value={value2}
                                            step={1}
                                            max={24}
                                            onChange={handleChange2}
                                            valueLabelDisplay="auto"
                                            marks={marks}
                                            getAriaValueText={(value2) => `${value2}:00HRS`}
                                            valueLabelFormat={(value2) => `${value2}:00`}
                                        />
                                    </div>   

                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {/* {i18n.t("campaigns.title")} */} Velocidade de envio
                                    </Typography> 
                                    <Box>
                                        <SpeedMessageCards />
                                    </Box> 
                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {/* {i18n.t("campaigns.title")} */} Nome da campanha
                                    </Typography> 
                                    <Field
                                        as={TextField}
                                        // label={i18n.t("departamentModal.form.name")}
                                        placeholder="Nome da campanha"
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        style={{ width : "100%"}}
                                        className={classes.textField}
                                    />
                                </Box>
                                <Box style={{ display: "flex", width: "100%", justifyContent: "space-between"}}>
                                    <Box style={{ width: "50%"}}>
                                        <Typography variant="h6">
                                            {/* {i18n.t("campaigns.title")} */} Inicio
                                        </Typography> 
                                        <Field
                                            as={TextField}
                                            id="datetime-local"
                                            type="datetime-local"
                                            defaultValue="2017-05-24T10:30"
                                            variant="outlined"
                                            //className={classes.textField}
                                            InputLabelProps={{
                                              shrink: true,
                                            }}
                                        />
                                    </Box>
                                    <Box style={{ width: "50%"}}>
                                        <Typography variant="h6">
                                            {/* {i18n.t("campaigns.title")} */} WhatsApp Bot
                                        </Typography> 
                                        <Field
                                            as={Select}
                                            // label={i18n.t("departamentModal.form.name")}
                                            placeholder="Nome da campanha"
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            margin="dense"
                                            style={{ width : "100%"}}
                                            className={classes.textField}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {/* {i18n.t("campaigns.title")} */} Mensagens
                                    </Typography> 
                                    <AppBar position="static" color="transparent">
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
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="outlined"
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
                                    <TabPanel value={value} index={1} className={classes.messageTab}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="outlined"
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
                                    <TabPanel value={value} index={2} className={classes.messageTab}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="outlined"
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
                                    <TabPanel value={value} index={3} className={classes.messageTab}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="outlined"
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
                                    <TabPanel value={value} index={4} className={classes.messageTab}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="messageOnDisconnect-label"
                                            id="messageOnDisconnect"
                                            variant="outlined"
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
                                </Box>
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