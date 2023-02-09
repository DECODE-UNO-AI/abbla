import React from "react";
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
        inputsOrder,
        setInputsOrder, 
        setAllMessagesInputs,
        allMessagesInputs,
        setSelectedPreviewMessage,
        setOpenPreview,
        handleDownload
    }
) => {

    const handleOnMediaChange = (input) => {
        const file = input.target.files[0]
        setMedias((e) => {
            return {...e, [input.target.name]: file}
        })
    }

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
                    <DynamicInputs values={values} setValues={setValues} messageInputs={allMessagesInputs} setMessageInputs={setAllMessagesInputs} messageIndex={1}
                        handleOnMediaChange={handleOnMediaChange}
                        inputOrder={inputsOrder} 
                        setInputOrder={setInputsOrder}
                        medias={medias}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                        handleDownload={handleDownload}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={allMessagesInputs} setMessageInputs={setAllMessagesInputs} messageIndex={2}
                        inputOrder={inputsOrder} 
                        setInputOrder={setInputsOrder}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                        handleDownload={handleDownload}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={allMessagesInputs} setMessageInputs={setAllMessagesInputs} messageIndex={3}
                        inputOrder={inputsOrder} 
                        setInputOrder={setInputsOrder}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                        handleDownload={handleDownload}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={3} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={allMessagesInputs} setMessageInputs={setAllMessagesInputs} messageIndex={4}
                        inputOrder={inputsOrder} 
                        setInputOrder={setInputsOrder}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                        handleDownload={handleDownload}
                    /> 
                </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={4} className={classes.messageTab} variant={"div"}>
                <Box style={{ maxWidth: 800}}>
                    <DynamicInputs values={values} setValues={setValues} messageInputs={allMessagesInputs} setMessageInputs={setAllMessagesInputs} messageIndex={5}
                        inputOrder={inputsOrder} 
                        setInputOrder={setInputsOrder}
                        medias={medias}
                        handleOnMediaChange={handleOnMediaChange}
                        setSelectedPreviewMessage={setSelectedPreviewMessage}
                        setOpenPreview={setOpenPreview}
                        handleDownload={handleDownload}
                    /> 
                </Box>
            </TabPanel>
        </Box>
    )
}

export default MessagesTabs;