import React, { useState, useEffect } from "react";
import { Typography, Box, AppBar, Tabs, Tab } from "@material-ui/core";
import DynamicInputs from "../DynamicInputs";

import { i18n } from "../../translate/i18n";

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

const MessagesTabs = (
    {
        classes, 
        tabValue, 
        handleTabChange, 
        values, 
        setValues, 
        medias, 
        setMedias, 
        setInputsOrder, 
        setAllMessagesInputs,
        setSelectedPreviewMessage,
        setOpenPreview,
    }
) => {

    const [message1Inputs, setMessage1Inputs] = useState([])
    const [input1Order, setInput1Order] = useState([]);
    const [message2Inputs, setMessage2Inputs] = useState([])
    const [input2Order, setInput2Order] = useState([]);
    const [message3Inputs, setMessage3Inputs] = useState([])
    const [input3Order, setInput3Order] = useState([]);
    const [message4Inputs, setMessage4Inputs] = useState([])
    const [input4Order, setInput4Order] = useState([]);
    const [message5Inputs, setMessage5Inputs] = useState([])
    const [input5Order, setInput5Order] = useState([]);

    const handleOnMediaChange = (input) => {
        const file = input.target.files[0]
        setMedias((e) => {
            return {...e, [input.target.name]: file}
        })
    }

    useEffect(() => {
        setAllMessagesInputs(e => ({...e, message1Inputs}))
    }, [message1Inputs, setAllMessagesInputs])

    useEffect(() => {
        setAllMessagesInputs(e => ({...e, message2Inputs}))
    }, [message2Inputs, setAllMessagesInputs])

    useEffect(() => {
        setAllMessagesInputs(e => ({...e, message3Inputs}))
    }, [message3Inputs, setAllMessagesInputs])

    useEffect(() => {
        setAllMessagesInputs(e => ({...e, message4Inputs}))
    }, [message4Inputs, setAllMessagesInputs])

    useEffect(() => {
        setAllMessagesInputs(e => ({...e, message5Inputs}))
    }, [message5Inputs, setAllMessagesInputs])

    useEffect(() => {
        setInputsOrder((e) => {
            return (
                {...e, message1InputOrder: input1Order}
            )
        })
    }, [input1Order, setInputsOrder])

    useEffect(() => {
        setInputsOrder((e) => {
            return (
                {...e, message2InputOrder: input2Order}
            )
        })
    }, [input2Order, setInputsOrder])

    useEffect(() => {
        setInputsOrder((e) => {
            return (
                {...e, message3InputOrder: input3Order}
            )
        })
    }, [input3Order, setInputsOrder])

    useEffect(() => {
        setInputsOrder((e) => {
            return (
                {...e, message4InputOrder: input4Order}
            )
        })
    }, [input4Order, setInputsOrder])

    useEffect(() => {
        setInputsOrder((e) => {
            return (
                {...e, message5InputOrder: input5Order}
            )
        })
    }, [input5Order, setInputsOrder])

    return (
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
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={message1Inputs} setMessageInputs={setMessage1Inputs} messageIndex={1}
                        handleOnMediaChange={handleOnMediaChange}
                        inputOrder={input1Order} 
                        setInputOrder={setInput1Order}
                        medias={medias}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={message2Inputs} setMessageInputs={setMessage2Inputs} messageIndex={2}
                        inputOrder={input2Order} 
                        setInputOrder={setInput2Order}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={message3Inputs} setMessageInputs={setMessage3Inputs} messageIndex={2}
                        inputOrder={input3Order} 
                        setInputOrder={setInput3Order}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={3} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={message4Inputs} setMessageInputs={setMessage4Inputs} messageIndex={2}
                        inputOrder={input4Order} 
                        setInputOrder={setInput4Order}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={4} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={message5Inputs} setMessageInputs={setMessage5Inputs} messageIndex={2}
                        inputOrder={input5Order} 
                        setInputOrder={setInput5Order}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                    /> 
                </Box>
            </TabPanel>
        </Box>
    )
}

export default MessagesTabs;