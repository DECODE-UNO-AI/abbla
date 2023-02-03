import React, { useEffect, useState } from 'react'
import { 
    Paper,
    Box, 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody,  
    TextField,
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import NearMeIcon from '@material-ui/icons/NearMe';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from "@material-ui/core/styles";
import { useParams } from 'react-router-dom';
import CampaignNumberCard from '../../components/CampaignNumberCard';
import Title from "../../components/Title";
import toastError from '../../errors/toastError';
import api from '../../services/api';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    infoPaper: {
        flex: 1,
        padding: 10,
		margin: theme.spacing(1),
        marginBottom: 20,
		overflowY: "scroll",
		...theme.scrollbarStyles,
    },
	mainPaper: {
		flex: 1,
		padding: theme.spacing(2),
		margin: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
        minHeight: "80vh"
	},
    Header: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: 10,
    },
    contactsTable: {
        marginTop: 10,
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
    cards: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40
    }
}));


const Campaign = () => {
    
    const classes = useStyles();

    const { campaignId } = useParams();
    const [campaign, setCampaign] = useState(null)
    const [contacts, setContacts] = useState([])
    const [search, setSearch] = useState(null)
    const [, setLoading] = useState(false)

    useEffect(() => {
        (async () => {
			setLoading(true);
			try {
			    const { data } = await api.get(`campaigns/details/${campaignId}`);
                setContacts(data.campaignContacts)
                setCampaign(data);
			    setLoading(false);
			} catch (err) {
			    toastError(err);
			    setLoading(false);
			}
		  })();
    }, [campaignId])

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
        <>
        <Box className={classes.infoPaper}>
            <Box className={classes.Header}>
                <Title>#{campaign?.id} {campaign?.name}</Title>
            </Box>
            <Box className={classes.cards}>
                <CampaignNumberCard color="#16a9fe" title={i18n.t("campaign.card.total")} number={campaign?.contactsNumber || 0}>
                    <EmailIcon style={{ color: "#16a9fe" }}/>
                </CampaignNumberCard>
                <CampaignNumberCard color="#3ac47d" title={i18n.t("campaign.card.sent")} number={campaign?.contactsSent || 0}>
                    <NearMeIcon style={{ color: "#3ac47d" }}/>
                </CampaignNumberCard>
                <CampaignNumberCard color="#d92550" title={i18n.t("campaign.card.failed")} number={campaign?.contactsFailed || 0}>
                    <CloseIcon style={{ color: "#d92550" }}/>
                </CampaignNumberCard>
            </Box>
        </Box>
        <Paper className={classes.mainPaper}>
            <Box className={classes.contactsTable}>
                <Box>
                    <TextField 
                        size='small'
                        variant="outlined"
                        id="search"
                        label={i18n.t("campaign.search")}
                        onChange={(e) => setSearch(e.target.value)} 
                        style={{ maxWidth: 200, marginBottom: 20 }} 
                        type="search"
                    />
                    {/* <Box>
                        {i18n.t(`campaigns.toolTips.title.${campaign?.status}`)}
                    </Box> */}
                </Box>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">
                                {i18n.t("campaign.table.number")}
                            </TableCell>
                            <TableCell align="left">
                                {i18n.t("campaign.table.sentDate")}
                            </TableCell>
                            <TableCell align="center">
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
                                        {contact.status === "sent" ? new Date(contact.updatedAt).toLocaleString() : "-"}
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Box style={{ width: "100%", display: "flex", justifyContent: "center"}}>
                                            <Box style={
                                                    {   
                                                        width: 140,
                                                        borderRadius: 4,
                                                        textAlign: "center",
                                                        color: "#FFF",
                                                        padding: 10, 
                                                        backgroundColor: contact.status === "sent" ? "#16a9fe"
                                                                        : contact.status === "invalid-number" ? "#d92550"
                                                                        : contact.status === "pending" ? "#ffc235" : ""
                                                    }
                                                }
                                            >
                                                {contact.status ? i18n.t(`campaign.status.${contact.status}`) : ""}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align='left'>
                                        <p style={{maxWidth: "40ch", overflow: "hidden", "textOverflow": "ellipsis", whiteSpace: "nowrap"}}>
                                            {contact.messageSent || "-"}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            
                            )
                        }
                    </TableBody>
                </Table>
            </Box>
        </Paper>
        </>
    )
}

export default Campaign;