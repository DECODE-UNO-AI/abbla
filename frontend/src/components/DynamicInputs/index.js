import React from 'react';
import { Field } from "formik";
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { Reorder, Close } from "@material-ui/icons";
import {arrayMoveImmutable} from 'array-move';
import { TextField, Box, makeStyles, Button, InputLabel } from '@material-ui/core';

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
    }
}));

const SortableItem = sortableElement(({ value, messageIndex, setMessageInputs, messageInputs, handleOnDeleteInput }) => {
    const classes = useStyles();
    const inputIndex = messageInputs.findIndex(input => input.id === value.id)
    
    return (
      <Box className={classes.inputContainer}>
        <Box className={classes.iconContainer}>
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
                disabled={false}
                style={{ width: "100%", padding: 0, cursor: "move"}}
                labelId="message2-label"
                id={`message${messageIndex}-${value.id}`}
                variant="outlined"
                margin="none"
                multiline
                maxRows={5}
                minRows={4}
                value={messageInputs[inputIndex].value}
                onChange={(e) => {
                    const value = e.target.value
                    setMessageInputs(inputs => {
                        inputs[inputIndex] = {...inputs[inputIndex], value: value}
                        return ([...inputs]);
                    })
                }}
            />
        ) : (
            <>
                {
                    messageInputs[inputIndex].value ? 
                    <Box className={classes.fileContainer}>
                        <InputLabel>{messageInputs[inputIndex].value?.name}</InputLabel>
                    </Box>
                    :
                    <Box className={classes.fileContainer}>
                        <input
                            id={`input${messageIndex}-${value.id}`} 
                            type="file"
                            onChange={(e) => {
                                const value = e.target.files[0]
                                setMessageInputs(inputs => {
                                inputs[inputIndex] = {...inputs[inputIndex], value: value}
                                return ([...inputs]);
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

const DynamicInputs = ({ messageInputs, setMessageInputs, messageIndex, inputOrder, setInputOrder, setSelectedPreviewMessage, setOpenPreview}) => {

    const classes = useStyles();

    const handleAddInput = () => {
        setMessageInputs([...messageInputs, { id: messageInputs.length, type: "text", value: "" }]);
        setInputOrder([...inputOrder, messageInputs.length]);
    };

    const handleOnDeleteInput = (inputIndex) => {
        messageInputs.splice(inputIndex, 1)
        const orderIndex = inputOrder.findIndex(i => i === inputIndex)
        inputOrder.splice(orderIndex, 1)
        setMessageInputs(e => [...e])
        setInputOrder(e => [...e])

    };

    const handleAddInputFile = () => {
        setMessageInputs([...messageInputs, { id: messageInputs.length, type: "file", value: "" }]);
        setInputOrder([...inputOrder, messageInputs.length]);
    };
  
    const onSortEnd = ({ oldIndex, newIndex }) => {
      setInputOrder(arrayMoveImmutable(inputOrder, oldIndex, newIndex));
    };
    return (
        <>  
            <SortableContainer onSortEnd={onSortEnd}>
                {inputOrder.map((inputId, index) => {
                    const input = messageInputs.find(input => input.id === inputId);
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
                            />
                        </>
                    );
                })}
            </SortableContainer>
            <Box className={classes.buttonContainer}>
                <Box>
                    <Button type="button" onClick={handleAddInput}>+TEXTO</Button>
                    <Button type="button" onClick={handleAddInputFile}>+ARQUIVO</Button>
                </Box>
                <Button type="button" onClick={() => {
                    setSelectedPreviewMessage(1)
                    setOpenPreview(true)
                }}>PREVIEW</Button>
            </Box>
        </>
    )
}
        

export default DynamicInputs;