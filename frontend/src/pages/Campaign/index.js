import React, { useEffect, useState } from 'react'
import { 
    Paper,
    Box, 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody, 
    Typography, 
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Drawer,
    Button

} from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { useParams } from 'react-router-dom';
import Title from "../../components/Title";
import toastError from '../../errors/toastError';
import api from '../../services/api';
import { i18n } from "../../translate/i18n";
import WhatsAppLayout from '../../components/WhatsappLayout';

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
        minHeight: "93vh"
	},
    Header: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: 10,
    },
    contactsTable: {
        marginTop: 40,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        justifyContent: "center",
    },
    mainContent: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        "@media (max-width: 720px)": {
            flexDirection: "column"
        }
    },
    preview: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    InfoTitle: {
        fontSize: 20,
        marginBottom: 10
    }, 
    drawer: {
        "& > div > div": { display: "flex", alignItems: "center", flexDirection: "column", padding: 10, minHeight: "100%", justifyContent: "center"}
    }
}));


const Campaign = () => {
    
    const classes = useStyles();

    const { campaignId } = useParams();
    const [campaign, setCampaign] = useState(null)
    const [contacts, setContacts] = useState([])
    const [search, setSearch] = useState(null)
    const [message, setMessage] = useState("message1")
    const [, setLoading] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)

    useEffect(() => {
        (async () => {
			setLoading(true);
			try {
			    const { data } = await api.get(`campaigns/details/${campaignId}`);
                setContacts(data.campaignContacts)
                setCampaign(data);
                console.log(data)
			    setLoading(false);
			} catch (err) {
			    toastError(err);
			    setLoading(false);
			}
		  })();
    }, [campaignId])

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
        }
    
        setPreviewOpen(open);
      };

    const filterContacts = search ? contacts.filter((contact) => contact.number.includes(search)) : contacts;

    // const handleDownload = async (isCsvFile) => {
    //     let response
    //     if (isCsvFile) {
    //         response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/public/${campaign?.contactsCsv}`)
    //     } else {
    //         response = await fetch(`${campaign?.mediaUrl}`)
    //     }
    //     const file = await response.blob();
    //     const fileUrl = URL.createObjectURL(file);
    //     const a = document.createElement("a");
    //     a.href = fileUrl;
    //     a.download = `${campaignId}contacts`;
    //     a.click();
    //     URL.revokeObjectURL(fileUrl);
    // }
    
    return(
        <Paper className={classes.mainPaper}>
            <Box className={classes.Header}>
                <Title>#{campaign?.id} {campaign?.name}</Title>
            </Box>
            <Box className={classes.mainContent}>
                <Box>
                    <Typography className={classes.InfoTitle}>
                    {i18n.t("campaign.inicialDate")}: {new Date(campaign?.inicialDate).toLocaleString()}
                    </Typography>
                    <Typography className={classes.InfoTitle}>
                    {i18n.t("campaign.delay")}: {campaign?.delay.split("-")[1]} segundos
                    </Typography>
                    <Typography className={classes.InfoTitle}>
                    {i18n.t("campaign.sendTime")}: {campaign?.sendTime.split("-")[0]} Horas à {campaign?.sendTime.split("-")[1]} Horas
                    </Typography>
                    <Typography className={classes.InfoTitle}>
                       Status: {campaign?.status ? i18n.t(`campaign.status.${campaign.status}`) : ""}
                    </Typography>
                    
                </Box>
                <Box className={classes.preview}>
                    <FormControl component="fieldset" style={{ margin: 40 }}>
                        <FormLabel component="legend">{i18n.t("campaign.message")}</FormLabel>
                            <RadioGroup aria-label="gender" name="gender1" value={message} onChange={(e) => setMessage(e.target.value)}>
                                { campaign?.message1 !== '' ? <FormControlLabel value="message1" control={<Radio />} label={`${i18n.t("campaign.message")} 1`} /> : ""}
                                { campaign?.message2 !== '' ? <FormControlLabel value="message2" control={<Radio />} label={`${i18n.t("campaign.message")} 2`} /> : ""}
                                { campaign?.message3 !== '' ? <FormControlLabel value="message3" control={<Radio />} label={`${i18n.t("campaign.message")} 3`} /> : ""}
                                { campaign?.message4 !== '' ? <FormControlLabel value="message4" control={<Radio />} label={`${i18n.t("campaign.message")} 4`} /> : ""}
                                { campaign?.message5 !== '' ? <FormControlLabel value="message5" control={<Radio />} label={`${i18n.t("campaign.message")} 5`} /> : ""}
                            </RadioGroup>
                    </FormControl>
                    <Typography className={classes.InfoTitle}>
                       <Button onClick={toggleDrawer(true)}>preview</Button>
                    </Typography>
                </Box>
                <Drawer anchor='right' open={previewOpen} className={classes.drawer} onClose={toggleDrawer(false)}>
                        <Button onClick={toggleDrawer(false)} style={{ marginBottom: 20}}>Close</Button>
                    
                        <WhatsAppLayout message={campaign?.[message]} mediaLink={campaign?.mediaUrl} mediaType={campaign?.mediaType} mediaBefore={campaign?.mediaBeforeMessage}/>
                   
                </Drawer>
            </Box>
            <Box className={classes.contactsTable}>
                <TextField 
                    size='small'
                    variant="outlined"
                    id="search"
                    label={i18n.t("campaign.search")}
                    onChange={(e) => setSearch(e.target.value)} 
                    style={{ maxWidth: 200, marginBottom: 20 }} 
                    type="search"
                />
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                {i18n.t("campaign.table.number")}
                            </TableCell>
                            <TableCell align="left">
                                {i18n.t("campaign.table.status")}
                            </TableCell>
                            <TableCell align="left">
                                {i18n.t("campaign.table.messageSent")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            filterContacts.map((contact) => 
                                <TableRow key={contact.id}>
                                    <TableCell align='left'>
                                        {contact.number}
                                    </TableCell>
                                    <TableCell align='left'>
                                        {contact.status ? i18n.t(`campaign.status.${contact.status}`) : ""}
                                    </TableCell>
                                    <TableCell align='left'>
                                        <p style={{maxWidth: "40ch", overflow: "hidden", "textOverflow": "ellipsis", whiteSpace: "nowrap"}}>
                                            {contact.messageSent}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            
                            )
                        }
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    )
}

export default Campaign;