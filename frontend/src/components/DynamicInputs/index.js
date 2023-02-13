import React from 'react';
import { Field } from "formik";
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { Reorder, Close, CloudUpload } from "@material-ui/icons";
import {arrayMoveImmutable} from 'array-move';
import { TextField, Box, makeStyles, Button, InputLabel } from '@material-ui/core';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    inputContainer: {
        zIndex: 999999999,
        width: "100%",
        cursor: "move",
        position: "relative",
        marginBottom: 10,
    },
    iconContainer: {
        position: "absolute", 
        top: 5, 
        right: 5,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        width: 45,
        gap: 5
    },
    icon: { 
        width: 20,
        cursor: "move", 
        opacity: 0.5,
        zIndex: 999999999, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        position: "relative"
    },
    fileContainer: {
        width: "100%",
        height: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: '1px dashed #909090',
        borderRadius: 5
    },
    button: {
        color: "#fff"
    },
    closeButton: {
        fontWeight: "bold",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        width: 25,
        height: 25,
        position: "absolute",
        zIndex: 99999
    },
    buttonContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    downloadContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 10
    }
}));

const SortableItem = sortableElement(({ value, messageIndex, setMessageInputs, messageInputs, handleOnDeleteInput, handleDownload, visualize }) => {
    const classes = useStyles();
    const inputIndex = messageInputs[`message${messageIndex}Inputs`].findIndex(input => input.id === value.id)
    const input = messageInputs[`message${messageIndex}Inputs`][inputIndex] || null
    return (
      <Box className={classes.inputContainer}>
        <Box className={classes.iconContainer} style={{ display: visualize ? "none" : ""}}>
            <Box className={classes.icon}>
                <Reorder />
            </Box>
            <Box className={classes.icon} style={{ cursor: "pointer", zIndex: 999999999}} >
                <Close />
                <button className={classes.closeButton} onClick={() => handleOnDeleteInput(value.id)}></button>
            </Box>
        </Box>
        {value.type === "text" ? (
            <Field
                as={TextField}
                disabled={visualize}
                style={{ width: "100%", padding: 0, cursor: "move"}}
                labelId="message2-label"
                id={`message${messageIndex}-${value.id}`}
                variant="outlined"
                margin="none"
                multiline
                maxRows={5}
                minRows={4}
                value={input.value}
                onChange={(e) => {
                    const value = e.target.value
                    setMessageInputs(i => {
                        i[`message${messageIndex}Inputs`][inputIndex] = {...input, value: value}
                        return ({...i});
                    })
                    
                }}
            />
        ) : (
            <>
                {
                    input.value ? 
                    <Box className={classes.fileContainer} style={{ cursor: visualize ? "auto" : "move"}}>
                        {
                            typeof input.value !== "string" ?
                            <InputLabel>{input.value?.name}</InputLabel>
                            :
                            <>
                                <Box className={classes.downloadContainer}>
                                    <InputLabel>{input.value.replace("file-", "")}</InputLabel>
                                    <Button
                                        onClick={() => handleDownload(false, input.value.replace("file-", ""))}
                                        color="primary"
                                        variant="contained"
                                    >
                                        Download
                                    </Button>
                                </Box>
                            </>

                        }
                    </Box>
                    :
                    <Box className={classes.fileContainer} style={{ cursor: visualize ? "auto" : "move"}}>
                        <label htmlFor={`input${messageIndex}-${value.id}`}>
                            <Button
                                variant="contained"
                                color="default"
                                component="span"
                                className={classes.button}
                                startIcon={<CloudUpload />}
                            >
                                Upload
                            </Button>
                        </label>
                        <input
                            id={`input${messageIndex}-${value.id}`} 
                            type="file"
                            style={{ display: "none "}}
                            onChange={(e) => {
                                const value = e.target.files[0]
                                setMessageInputs(i => {
                                i[`message${messageIndex}Inputs`][inputIndex] = {...input, value: value}
                                return ({...i});
                                })
                            }}
                        />
                    </Box>
                }
            </>
        )}
      </Box>
    );
});

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

const DynamicInputs = ({ messageInputs, setMessageInputs, messageIndex, inputOrder, setInputOrder, setOpenPreview, handleDownload, visualize}) => {

    const classes = useStyles();

    const currentInputOrder = inputOrder[`message${messageIndex}InputOrder`] || []
    const currentMessageInputs = messageInputs[`message${messageIndex}Inputs`] || []

    const handleAddInput = () => {
        setMessageInputs(e => ({...e,  [`message${messageIndex}Inputs`]: [...currentMessageInputs, { id: currentMessageInputs.length, type: "text", value: "" }]}))
        setInputOrder(e => ({...e, [`message${messageIndex}InputOrder`]: [...currentInputOrder, currentMessageInputs.length]}));
    };

    const handleAddInputFile = () => {
        setMessageInputs(e => ({...e,  [`message${messageIndex}Inputs`]: [...currentMessageInputs, { id: currentMessageInputs.length, type: "file", value: "" }]}))
        setInputOrder(e => ({...e, [`message${messageIndex}InputOrder`]: [...currentInputOrder, currentMessageInputs.length]}));
    };

    const handleOnDeleteInput = (inputIndex) => {
        messageInputs[`message${messageIndex}Inputs`].splice(inputIndex, 1)
        const orderIndex = inputOrder[`message${messageIndex}InputOrder`].findIndex(i => i === inputIndex)
        inputOrder[`message${messageIndex}InputOrder`].splice(orderIndex, 1)
        setMessageInputs(e => ({...e}))
        setInputOrder(e => ({...e}))

    };

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setInputOrder(e => ({...e, [`message${messageIndex}InputOrder`]: arrayMoveImmutable(currentInputOrder, oldIndex, newIndex)}));
    };
    
    return (
        <>  
            <SortableContainer onSortEnd={onSortEnd} distance={visualize ? 99999999999 : 1} >
                {currentInputOrder.map((inputId, index) => {
                    const input = currentMessageInputs.find(input => input.id === inputId);
                    
                    return (
                        <>  
                            <SortableItem 
                                messageIndex={messageIndex} 
                                key={`message${messageIndex}-${input.id}`} 
                                index={index} 
                                value={input} 
                                setMessageInputs={setMessageInputs}
                                messageInputs={messageInputs}
                                handleOnDeleteInput={handleOnDeleteInput}
                                handleDownload={handleDownload}
                                distance={400}
                                visualize={visualize}
                            />
                        </>
                    );
                })}
            </SortableContainer>
            <Box className={classes.buttonContainer}>
                <Box>
                    {
                        visualize ? "" : 
                        <>
                            <Button type="button" onClick={handleAddInput}>+{i18n.t("campaignModal.form.addText")}</Button>
                            <Button type="button" onClick={handleAddInputFile}>+{i18n.t("campaignModal.form.addFile")}</Button>
                        </>
                    }
                </Box>
                <Button type="button" onClick={() => {
                    setOpenPreview(true)
                }}>PREVIEW</Button>
            </Box>
        </>
    )
}
        

export default DynamicInputs;