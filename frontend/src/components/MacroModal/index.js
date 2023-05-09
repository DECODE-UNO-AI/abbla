import React, { useState } from "react";
import * as Yup from "yup";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  makeStyles,
  TextField,
  Typography,
  Box,
} from "@material-ui/core";

import NearMeIcon from "@material-ui/icons/NearMe";
import { Formik, Form, Field } from "formik";
import { i18n } from "../../translate/i18n";
import DynamicInputs from "../DynamicInputs";
import WhatsAppLayout from "../WhatsappLayout";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  slider: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  messageTab: {
    "& > div": {
      padding: 0,
      paddingTop: 20,
    },
  },
  dialog: {
    "& > div > div": {
      width: "100%",
      maxWidth: 800,
    },
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  box: {
    marginBottom: 30,
  },
  multipleInput: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 30,
    "@media (max-width: 720px)": {
      flexDirection: "column",
    },
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
      },
    },
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    "@media (max-width: 720px)": {
      flexDirection: "column",
      alignItems: "start",
      justifyContent: "center",
    },
  },
  variableContent: {
    display: "flex",
    maxWidth: 800,
    justifyContent: "left",
    alignItems: "center",
  },
  chipBox: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  },
  testContainer: {
    margin: "0 auto 10px auto",
    width: "90%",
    marginTop: 20,
  },
  numberTestContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  },
  previewBox: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  },
  previewContainer: {
    height: "100%",
    minHeight: "400px",
    margin: 25,
    "@media (max-width: 720px)": {
      margin: 0,
      marginTop: 20,
    },
  },
}));

function getFirstDate() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  const dateString = currentDate.toISOString().substring(0, 16);
  return dateString;
}

const MacroSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("campaignModal.errors.tooShort"))
    .max(50, i18n.t("campaignModal.errors.tooLong"))
    .required(" "),
});

const MacroModal = ({ open, onClose, visualize }) => {
  const [submittingForm, setSubmittingForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [testNumber, setTestNumber] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [allMessagesInputs, setAllMessagesInputs] = useState({
    message1Inputs: [],
  });

  const [inputsOrder, setInputsOrder] = useState({
    message1InputOrder: [],
    message2InputOrder: [],
    message3InputOrder: [],
    message4InputOrder: [],
    message5InputOrder: [],
  });

  const initialState = {
    name: "",
    whatsappId: "",
    columnName: "",
  };

  const [campaignForm, setCapaignForm] = useState(initialState);

  const classes = useStyles();

  const handleOnModalClose = () => {
    setCapaignForm(initialState);
    setInputsOrder([]);
    setAllMessagesInputs([]);
    onClose();
  };

  const handleOnTest = async (values) => {
    setSubmittingForm(true);
    const { whatsappId } = values;
    const messages = allMessagesInputs[`message${tabValue + 1}Inputs`];
    let medias = [];
    if (!whatsappId || !messages || !testNumber || messages.length < 1) {
      toast.error(`${i18n.t("campaigns.notifications.campaignTestFailed")}`);
      setSubmittingForm(false);
      return;
    }
    let message = inputsOrder[`message${tabValue + 1}InputOrder`].map(
      (index) => {
        const input = messages.find((inp) => inp.id === index);
        if (input.type === "text") {
          return input.value ? input.value : null;
        } else {
          if (typeof input.value !== "string") {
            medias.push(input.value);
            return `file-${input.value.name}`;
          }
          return input.value;
        }
      }
    );
    message = JSON.stringify(message.filter((i) => i !== null));
    const data = { whatsappId, message, number: testNumber };
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    medias = [...new Set(medias.map((media) => media.name))].map((name) => {
      return medias.find((media) => media.name === name);
    });
    medias.forEach((file) => {
      formData.append("medias", file);
    });

    try {
      await api.post(`/campaigns/test`, formData, {
        // preciso editar isso <--
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      toast.success(`${i18n.t("campaigns.notifications.campaignTested")}`);
      setSubmittingForm(false);
    } catch (err) {
      setSubmittingForm(false);
      toastError(err);
    }
  };

  const handleOnSave = async (values) => {
    setSubmittingForm(true);
    let form = {
      ...values,
    };
    const formData = new FormData();
    let medias = [];
    Object.keys(allMessagesInputs).forEach((messageInput, index) => {
      let message = inputsOrder[`message${index + 1}InputOrder`].map((i) => {
        const input = allMessagesInputs[messageInput].find(
          (inp) => inp.id === i
        );
        if (input.type === "text") {
          return input.value ? input.value : null;
        } else {
          if (typeof input.value !== "string") {
            medias.push(input.value);
            return `file-${input.value.name}`;
          }
          return input.value;
        }
      });
      message = JSON.stringify(message.filter((i) => i !== null));
      form = { ...form, [`message${index + 1}`]: message };
    });
    if (form.message1.length === 0) {
      toast.error("A mensagem é obrigatória");
      setSubmittingForm(false);
      return;
    }
    medias = [...new Set(medias.map((media) => media.name))].map((name) => {
      return medias.find((media) => media.name === name);
    });

    medias.forEach((file) => {
      if (typeof file !== "string") formData.append("medias", file);
    });

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      // aqui eu vou fazer a chamada para salvar o macro no banco de dados
      await api.post(`/macros`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      toast.success(`Macro salvo com sucesso`);
      onClose();
      setSubmittingForm(false);
    } catch (err) {
      setSubmittingForm(false);
      toastError(err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleOnModalClose}
      className={classes.dialog}
      scroll="paper"
    >
      <DialogTitle id="form-dialog-title">Macro</DialogTitle>
      <Formik
        initialValues={campaignForm}
        enableReinitialize={true}
        validationSchema={MacroSchema}
        onSubmit={async (values, actions) => {
          await handleOnSave(values);
          actions.setSubmitting(false);
        }}
      >
        {({ touched, errors, isSubmitting, values, setValues }) => {
          return (
            <>
              <Form>
                <DialogContent
                  dividers
                  style={{
                    widht: 800,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ width: "100%" }} className={classes.box}>
                    <Typography variant="h6">Nome do Macro</Typography>
                    <Field
                      as={TextField}
                      placeholder="Nome do Macro"
                      name="name"
                      id="name"
                      disabled={visualize}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      style={{ width: "100%" }}
                      className={classes.textField}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    />
                  </Box>
                  <Box sx={{ width: "100%" }} className={classes.box}>
                    <Typography variant="h6">
                      {i18n.t("campaignModal.form.messages")}
                    </Typography>
                    <DynamicInputs
                      values={values}
                      setValues={setValues}
                      messageInputs={allMessagesInputs}
                      setMessageInputs={setAllMessagesInputs}
                      messageIndex={1}
                      handleOnMediaChange={null}
                      inputOrder={inputsOrder}
                      setInputOrder={setInputsOrder}
                      medias={null}
                      setOpenPreview={setOpenPreview}
                      handleDownload={null}
                      visualize={visualize}
                      setOpenIAModal={null}
                      setModalInput={null}
                    />
                  </Box>
                </DialogContent>
                <Dialog
                  open={openPreview}
                  onClose={() => {
                    setOpenPreview(false);
                  }}
                  className={classes.dialog}
                  scroll="paper"
                >
                  <DialogTitle id="form-dialog-title">
                    {i18n.t("campaignModal.title.preview") + ":"}
                  </DialogTitle>
                  <DialogContent style={{ padding: 0, minHeight: "400px" }}>
                    <Box className={classes.previewContainer}>
                      <WhatsAppLayout
                        messages={
                          allMessagesInputs[`message${tabValue + 1}Inputs`]
                        }
                        order={inputsOrder[`message${tabValue + 1}InputOrder`]}
                      />
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        setOpenPreview(false);
                      }}
                      variant="outlined"
                    >
                      {i18n.t("campaignModal.buttons.close")}
                    </Button>
                  </DialogActions>
                </Dialog>
                <Box className={classes.testContainer}>
                  <Typography variant="h6">
                    {i18n.t("campaignModal.form.testMessage")}
                  </Typography>
                  <Box className={classes.numberTestContainer}>
                    <TextField
                      className={classes.inputTest}
                      placeholder={i18n.t(
                        "campaignModal.form.testNumberPlaceholder"
                      )}
                      inputProps={{ "aria-label": "message test" }}
                      variant="outlined"
                      size="small"
                      style={{ width: "100%" }}
                      onChange={(e) => setTestNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    />
                    <Button
                      color="primary"
                      disabled={submittingForm}
                      variant="contained"
                      onClick={() => handleOnTest(values)}
                      style={{ marginLeft: 20 }}
                    >
                      {i18n.t("campaignModal.form.testButton")}
                      {submittingForm && (
                        <CircularProgress
                          size={20}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </Box>
                </Box>
                <DialogActions>
                  <Button
                    onClick={onClose}
                    color="secondary"
                    disabled={submittingForm}
                    variant="outlined"
                  >
                    {i18n.t("campaignModal.buttons.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={submittingForm}
                    variant="contained"
                  >
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Salvar Macro
                      <NearMeIcon style={{ marginLeft: 5 }} />
                    </span>

                    {submittingForm && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                </DialogActions>
              </Form>
            </>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default MacroModal;
