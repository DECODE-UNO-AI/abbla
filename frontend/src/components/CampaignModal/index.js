import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import {
	Formik,
	Form,
	Field
} from "formik";

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
    Chip,
	TextField,
    Checkbox,
    Typography,
    Tab,
    Tabs,
    AppBar,
    Box,
} from '@material-ui/core';


import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

import api from "../../services/api";
import useWhatsApps from "../../hooks/useWhatsApps";
import SpeedMessageCards from "../SpeedMessageCards";
// import Papa from 'papaparse';


const useStyles = makeStyles(theme => ({
    slider: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    messageTab: {
        "& > div": {
            padding: 0,
            paddingTop: 20
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
    },
    multipleInput: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        marginBottom: 30,
        "@media (max-width: 720px)": {
            flexDirection: "column"
        }
    },
    dateInput: {
        "& > div > input": {
            padding: "11px 14px",
        },
        "& > div": {
            width: "200px",
        },
        "@media (max-width: 720px)": {
            "& > div": {
                width: "100%",
            }
        }
    },
    inputBox: {
        display: "flex",
        alignItems: "center",
        "@media (max-width: 720px)": {
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "center"
        }
    },
    variableContent: {
        display: "flex",
        width: "100%",

    },
    chipBox: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2
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

function getFirstDate(){
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const dateString = currentDate.toISOString().substring(0,16);
    return dateString
}

function getColumns(file, setCsvColumns) {
    // Most perfomatic but dosen't work with ; delimiter
    /* Papa.parse(file, {
        header: true,
        preview: 1,
        delimitersToGuess: [";",".", ",", "-", "/", "|", "_", Papa.RECORD_SEP, Papa.UNIT_SEP],
        complete: (results) => { 
            setCsvColumns(Object.keys(results.data[0])) 
        }
      }); */
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvFile = e.target.result
        const firstLine = csvFile.slice(0, csvFile.indexOf('\n'))
        setCsvColumns(firstLine.trim().split(/[;\\.\\,\-\\/\\|_]+/))
      }
      reader.readAsText(file)
}

const CampaignSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, i18n.t("campaignModal.errors.tooShort"))
		.max(50, i18n.t("campaignModal.errors.tooLong"))
		.required(" "),
    whatsappId: Yup.string().required("Required"),
    message1: Yup.string()
        .min(5, i18n.t("campaignModal.errors.tooShort"))
        .max(255, i18n.t("campaignModal.errors.tooLong"))
        .required(i18n.t("campaignModal.errors.message")),
    message2: Yup.string().min(5, i18n.t("campaignModal.errors.tooShort")).max(255, i18n.t("campaignModal.errors.tooLong")),
    message3: Yup.string().min(5, i18n.t("campaignModal.errors.tooShort")).max(255, i18n.t("campaignModal.errors.tooLong")),
    message4: Yup.string().min(5, i18n.t("campaignModal.errors.tooShort")).max(255, i18n.t("campaignModal.errors.tooLong")),
    message5: Yup.string().min(5, i18n.t("campaignModal.errors.tooShort")).max(255, i18n.t("campaignModal.errors.tooLong")),
    columnName: Yup.string().required(" "),
});

const CampaignModal = ({ open, onClose, campaignId }) => {
	const classes = useStyles();
    const { whatsApps } = useWhatsApps()

    const initialState = {
        name: "",
        sendTime: [0, 24],
        delay: "15",
        inicialDate: getFirstDate(),
        startNow: false,
        whatsappId: "",
        message1: "",
        message2: "",
        message3: "",
        message4: "",
        message5: "",
        columnName: "",
        mediaBeforeMessage: "true",
    };

    const [campaignForm, setCapaignForm] = useState(initialState)
    const [sendTime, setSendTime] = useState(initialState.sendTime);
    const [delay, setDelay] = useState("15")
    const [tabValue, setTabValue] = useState(0);
    const [startNow, setStartNow] = useState(false);
    const [cvsFile, setCsvFile] = useState(null)
    const [csvColumns, setCsvColumns] = useState([])
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaError, setMediaError] = useState(false)
    const [mediaFirst, setMediaFirst] = useState(true)
    const inputFileRef = useRef();

    useEffect(() => {
        (async () => {
			if (!campaignId) return;
			try {
				const { data } = await api.get(`/campaigns/${campaignId}`);
                const sendInterval = data.sendTime.split('-').map(n => +n)
                setSendTime(sendInterval)
                const delayValue =
                    data.delay === "120-240"
                    ? "15"
                    : data.delay === "60-120"
                    ? "30"
                    : data.delay === "30-60"
                    ? "60"
                    : data.delay === "15-30"
                    ? "120"
                    : data.delay === "10-15"
                    ? "240"
                    : null;
                setDelay(delayValue);
                const settedDate = data.inicialDate.substring(0,16)
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/public/${data.contactsCsv}`)
                    const blobFile = await response.blob()
                    if (blobFile) {
                        const file = new File([blobFile], "text.csv", { type: "text/csv"})
                        getColumns(file, setCsvColumns)
                    }
                } catch(err) {
                    toastError(err)
                }
				setCapaignForm(prevState => {
					return { ...prevState, ...data, inicialDate: settedDate};
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
            setMediaError(false)
			setCapaignForm(initialState);
            setCsvColumns([]);
            setMediaFile(null);
            setCsvFile(null);
            setStartNow(false)
		};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId])


    const handleOnSendTimeInputChange = (event, value) => {
        setSendTime(value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOnChecked = () => {
        setStartNow(e => !e)
    }

    const handleOnCsvFileChange = (file) => {
        setCsvColumns([])
        if (!file.target.files[0]) {
            setCsvFile(null)
            setCsvColumns([])
            return
        }
        setCsvFile(file.target.files[0])
        getColumns(file.target.files[0], setCsvColumns)

    }

    const handleOnMediaFileChange = (file) => {
        setMediaError(false)
        const fileMedia = file.target.files[0]
        if (!fileMedia) {
            setMediaFile(null)
            return
        }
        if (fileMedia.size > 10 * 1024 * 1024){ // 10mb 
            setMediaFile(null)
            inputFileRef.current.value = null;
            setMediaError(true);
        }
            
        setMediaFile(fileMedia)
    }

    const handleDownload = async (isCsvFile) => {
        let response
        if (isCsvFile) {
            response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/public/${campaignForm.contactsCsv}`)
        } else {
            response = await fetch(`${campaignForm.mediaUrl}`)
        }
        const file = await response.blob();
        const fileUrl = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `${campaignId}contacts`;
        a.click();
        URL.revokeObjectURL(fileUrl);
    }

    const handleOnSave = async(values) => {
        setMediaError(false)    
        const campaignData = ({...values, delay: delay, startNow, sendTime, mediaBeforeMessage: mediaFirst})
        const formData = new FormData();
        Object.keys(campaignData).forEach((key) => {
            formData.append(key, campaignData[key])
        })
        if (cvsFile) {
            formData.append("medias", cvsFile)
        }
        if (mediaFile) {
            formData.append("medias", mediaFile)
        }
        try {
            if (campaignId) {
                await api.put(`/campaigns/${campaignId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    }
                });
            } else {
                await api.post("/campaigns", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                    }
                });
            }
            toast.success(`${i18n.t("campaigns.notifications.campaignSaved")}`);
            onClose();
        } catch (err) {
            toastError(err);
        }
    }

	return (

			<Dialog
				open={open}
				onClose={onClose}
				className={classes.dialog}
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{campaignId
						? `${i18n.t("campaignModal.title.edit")}`
						: `${i18n.t("campaignModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={campaignForm}
					enableReinitialize={true}
					validationSchema={CampaignSchema}
					onSubmit={async (values, actions) => {
						setTimeout(async () => {
							await handleOnSave(values); // testar se agora o botão não fica mais clicável
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers style={{ widht: 800, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                <Box sx={{ width: "100%" }}  className={classes.box}>
                                    <Typography variant="h6">
                                        {i18n.t("campaignModal.form.sendTime")}
                                    </Typography>
                                    <div style={{ paddingLeft: 15, paddingRight: 15}}>
                                        <Slider 
                                            getAriaLabel={() => 'Hours'}
                                            name="sendTime"
                                            id="sendTime"
                                            step={1}
                                            max={24}
                                            onChange={handleOnSendTimeInputChange}
                                            valueLabelDisplay="auto"
                                            marks={marks}
                                            value={sendTime}
                                            getAriaValueText={(value) => `${value}:00HRS`}
                                            valueLabelFormat={(value) => `${value}:00`}
                                        />
                                    </div>   

                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {i18n.t("campaignModal.form.delay")}
                                    </Typography> 
                                    <Box>
                                        <SpeedMessageCards delay={delay} setDelay={setDelay}/>
                                    </Box> 
                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {i18n.t("campaignModal.form.name")}
                                    </Typography> 
                                    <Field
                                        as={TextField}
                                        placeholder={i18n.t("campaignModal.form.name")}
                                        name="name"
                                        id="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        style={{ width : "100%"}}
                                        className={classes.textField}
                                    />
                                </Box>
                                <Box className={classes.multipleInput}>
                                    <Box style={{ width: "50%"}}>
                                        <Typography variant="h6">
                                            {i18n.t("campaignModal.form.start")}
                                        </Typography> 
                                        <Box className={classes.inputBox }>
                                            <Field
                                                as={TextField}
                                                id="inicialDate"
                                                name="inicialDate"
                                                type="datetime-local"
                                                variant="outlined"
                                                disabled={startNow}
                                                className={classes.dateInput}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                            <Box style={{ display: "flex", alignItems: "center" }}>
                                                <Checkbox
                                                  checked={startNow}
                                                  name="startNow"
                                                  onChange={handleOnChecked}
                                                  color={"primary"}
                                                  inputProps={{ 'aria-label': 'primary checkbox' }}
                                                />
                                                <InputLabel>{i18n.t("campaignModal.form.startCheck")}</InputLabel>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box style={{ width: "50%"}}>
                                        <Typography variant="h6">
                                            {i18n.t("campaignModal.form.whatsappId")}
                                        </Typography> 
                                        <Field
											as={Select}
											name="whatsappId"
                                            id="whatsappId"
                                            error={touched.whatsappId && Boolean(errors.whatsappId)}
                                            helperText={touched.whatsappId && errors.whatsappId}
                                            variant="outlined"
                                            margin="dense"
                                            style={{ width: "100%", paddingRight: 10}}
										>
											{whatsApps?.map((whatsapp) => (
												<MenuItem key={whatsapp.id} value={`${whatsapp.id}`}>{whatsapp.name}</MenuItem>
											))}
										</Field>
                                    </Box>
                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Box className={classes.multipleInput}>
                                        <Box style={{ width: "50%"}}>
                                            <Typography variant="h6">
                                                {i18n.t("campaignModal.form.csvMedia")}
                                            </Typography>
                                            <Box style={{ display: "flex", flexDirection: "column", alignItems: "start", marginTop: 15}}>
                                                {
                                                    campaignId ? 
                                                        <Button
                                                            style={{ marginBottom: 10 }}
                                                            onClick={() => handleDownload(true)}
                                                            color="primary"
                                                            disabled={isSubmitting}
                                                            variant="contained"
                                                        >
                                                            Download
                                                        </Button>
                                                    : ""
                                                }
                                                <input 
                                                    style={{ marginTop: 5, cursor: "pointer" }}
                                                    onChange={handleOnCsvFileChange}
                                                    accept=".csv"
                                                    type="file" 
                                                />
                                            </Box>
                                        </Box>
                                        <Box style={{ width: "50%"}}>
                                            <Typography variant="h6">
                                                {i18n.t("campaignModal.form.columnName")}
                                            </Typography> 
                                            <Field
                                                as={Select}
                                                name="columnName"
                                                id="columnName"
                                                error={touched.columnName && Boolean(errors.columnName)}
                                                helperText={touched.columnName && errors.columnName}
                                                variant="outlined"
                                                margin="dense"
                                                placeholder="test"
                                                style={{ width: "100%", paddingRight: 10}}
                                            >
                                                {csvColumns?.map((col, index) => (
                                                    <MenuItem key={index} value={`${col}`}>{col}</MenuItem>
                                                ))}
                                            </Field>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ width: "100%" }} className={classes.box}>
                                    <Typography variant="h6">
                                        {i18n.t("campaignModal.form.messages")}
                                    </Typography> 
                                    <AppBar position="static" color="transparent">
                                        <Tabs
                                            value={tabValue}
                                            onChange={handleTabChange}
                                            indicatorColor="primary"
                                            textColor="primary"
                                            variant="scrollable"
                                            scrollButtons="auto"
                                            aria-label="scrollable auto tabs example"
                                        >
                                        <Tab label={`${i18n.t("campaignModal.form.tab")} 1`} {...a11yProps(0)} />
                                        <Tab label={`${i18n.t("campaignModal.form.tab")} 2`} {...a11yProps(1)} />
                                        <Tab label={`${i18n.t("campaignModal.form.tab")} 3`} {...a11yProps(2)} />
                                        <Tab label={`${i18n.t("campaignModal.form.tab")} 4`} {...a11yProps(3)} />
                                        <Tab label={`${i18n.t("campaignModal.form.tab")} 5`} {...a11yProps(4)} />
                                        </Tabs>
                                    </AppBar>
                                    <TabPanel value={tabValue} index={0} className={classes.messageTab} variant={"div"}>
                                        <Box>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="message1-label"
                                            id="message1"
                                            variant="outlined"
                                            margin="none"
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            name="message1"
                                            error={touched.message1 && Boolean(errors.message1)}
                                            helperText={touched.message1 && errors.message1}
								        />
                                        </Box>
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={1} className={classes.messageTab} variant={"div"}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="message2-label"
                                            id="message2"
                                            variant="outlined"
                                            margin="none"
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            name="message2"
                                            error={touched.message2 && Boolean(errors.message2)}
                                            helperText={touched.message2 && errors.message2}
								        />
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={2} className={classes.messageTab} variant={"div"}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="message3-label"
                                            id="message3"
                                            variant="outlined"
                                            margin="none"
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            name="message3"
                                            error={touched.message3 && Boolean(errors.message3)}
                                            helperText={touched.message3 && errors.message3}
								        />
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={3} className={classes.messageTab} variant={"div"}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="message4-label"
                                            id="message4"
                                            variant="outlined"
                                            margin="none"
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            name="message4"
                                            error={touched.message4 && Boolean(errors.message4)}
                                            helperText={touched.message4 && errors.message4}
								        />
                                    </TabPanel>
                                    <TabPanel value={tabValue} index={4} className={classes.messageTab} variant={"div"}>
                                        <Field
                                            as={TextField}
									        style={{ width: "100%", padding: 0}}
                                            labelId="message5-label"
                                            id="message5"
                                            variant="outlined"
                                            margin="none"
                                            multiline
                                            maxRows={5}
                                            minRows={4}
                                            name="message5"
                                            error={touched.message5 && Boolean(errors.message5)}
                                            helperText={touched.message5 && errors.message5}
								        />
                                    </TabPanel>
                                    {   
                                        errors.message1 ? setTabValue(0) :
                                        errors.message2 ? setTabValue(1) :
                                        errors.message3 ? setTabValue(2) : 
                                        errors.message4 ? setTabValue(3) :
                                        errors.message5 ? setTabValue(4) : ""
                                    }
                                </Box>
                                <Box className={classes.variableContent}>
                                    <InputLabel style={{ display: "flex", alignItems: "center", marginRight: 2}}>{i18n.t("campaignModal.form.variables")}</InputLabel>
                                    <Box className={classes.chipBox}>
                                        {csvColumns.map((col, index) => 
                                            <Chip key={index} label={col} />
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ width: "100%", marginTop: 10 }} className={classes.box}>
                                    <Typography variant="h6">
                                        {i18n.t("campaignModal.form.messageMedia")}
                                    </Typography>
                                    <Box style={{ display: "flex", alignItems: "center" }}>
                                        <Field
                                            as={Checkbox}
                                            checked={mediaFirst}
                                            onChange={(e) => setMediaFirst(e.target.checked)}
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                            name="mediaBeforeMessage"
								        />
                                        <InputLabel>
                                            {i18n.t("campaignModal.form.sendMediaBefore")}
                                        </InputLabel>
                                    </Box>
                                    <Box style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 15}}>
                                        {
                                            campaignId && campaignForm.mediaUrl ? 
                                                <>
                                                <Button
                                                    style={{ marginBottom: 10 }}
                                                    onClick={() => handleDownload(false)}
                                                    color="primary"
                                                    disabled={isSubmitting}
                                                    variant="contained"

                                                >
                                                    Download
                                                </Button>
                                                <p>Ou</p>
                                                </>
                                            : ""
                                        }
                                        <input
                                            style={{ marginTop: 5 }}
                                            onChange={handleOnMediaFileChange}
                                            ref={inputFileRef}
                                            type="file"                                      
                                        />
                                        {mediaError ? <span style={{ color: "#ff5d32"}}>{i18n.t("campaignModal.errors.fileError")}</span> : ""}
                                    </Box>
                                </Box>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={onClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("campaignModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{campaignId
										? `${i18n.t("campaignModal.buttons.okEdit")}`
										: `${i18n.t("campaignModal.buttons.okAdd")}`}
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