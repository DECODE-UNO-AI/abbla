import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
} from "@material-ui/core";

import NearMeIcon from "@material-ui/icons/NearMe";
import { Formik, Form, Field } from "formik";
import { i18n } from "../../translate/i18n";
import DynamicInputs from "../DynamicInputs";
import WhatsAppLayout from "../WhatsappLayout";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";

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
    margin: "20px auto 10px auto",
    width: "90%",
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

const MacroSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("campaignModal.errors.tooShort"))
    .max(50, i18n.t("campaignModal.errors.tooLong"))
    .required(" "),
});

const MacroModal = ({ open, onClose, visualize, macroId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    whatsappId: "",
    columnName: "",
    message1: [],
  };
  const { whatsApps } = useWhatsApps();
  const [whatsappsApis, setWhatsappsApis] = useState([]);
  const [macroForm, setMacroForm] = useState(initialState);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [testNumber, setTestNumber] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [allMessagesInputs, setAllMessagesInputs] = useState({
    message1Inputs: [],
  });

  const [inputsOrder, setInputsOrder] = useState({
    message1InputOrder: [],
  });

  useEffect(() => {
    (async () => {
      if (!macroId) return;
      try {
        const {
          data: { macro },
        } = await api.get(`/macros/${macroId}`);
        setMacroForm((prevState) => {
          return { ...prevState, ...macro };
        });

        if (macro?.whatsappApiId) {
          setMacroForm((prevState) => {
            return { ...prevState, whatsappId: `api-${macro?.whatsappApiId}` };
          });
        }

        setAllMessagesInputs({
          message1Inputs: macro?.message1.map((message, index) => {
            if (message.startsWith("file-")) {
              return { id: index, type: "file", value: message };
            }
            return { id: index, type: "text", value: message };
          }),
        });

        setInputsOrder({
          message1InputOrder: macro?.message1.map((message, index) => index),
        });
      } catch (error) {
        toastError(error);
      }
    })();

    return () => {
      setMacroForm(initialState);
      setInputsOrder([]);
      setAllMessagesInputs([]);
    };
  }, [macroId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/whatsappapi");
        const wtsapps = response.data.whatsapps;
        setWhatsappsApis(wtsapps);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleOnModalClose = () => {
    setMacroForm(initialState);
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
      toast.error(`${i18n.t("macros.notifications.macroTestFailed")}`);
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
      await api.post(`/macros/test`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      toast.success(`${i18n.t("macros.notifications.macroTested")}`);
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
      if (macroId) {
        await api.put(`/macros/${macroId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        });
        toast.success(`Macro Editado com sucesso`);
      } else {
        await api.post(`/macros`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        });
        toast.success(`Macro salvo com sucesso`);
      }
      handleOnModalClose();
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
      <DialogTitle id="form-dialog-title">
        {macroId
          ? i18n.t("macros.modal.updateMacroTitle")
          : i18n.t("macros.modal.createMacroTitle")}
      </DialogTitle>
      <Formik
        initialValues={macroForm}
        enableReinitialize={true}
        validationSchema={MacroSchema}
        onSubmit={async (values, actions) => {
          await handleOnSave(values);
          actions.setSubmitting(false);
        }}
      >
        {({ touched, errors, values, setValues }) => {
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
                    <Typography variant="h6">
                      {i18n.t("macros.modal.form.messagesPlaceholder")}
                    </Typography>
                    <Field
                      as={TextField}
                      placeholder={i18n.t(
                        "macros.modal.form.messagesPlaceholder"
                      )}
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
                      {i18n.t("macros.modal.form.messages")}
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
                      isMacro={true}
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
                    {i18n.t("macros.modal.preview.title") + ":"}
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
                      {i18n.t("macros.buttons.close")}
                    </Button>
                  </DialogActions>
                </Dialog>
                <Box style={{ width: "90%", margin: "20px auto 10px auto" }}>
                  <Typography variant="h6">
                    {i18n.t("campaignModal.form.whatsappId")}
                  </Typography>
                  <Field
                    as={Select}
                    name="whatsappId"
                    id="whatsappId"
                    disabled={visualize}
                    error={touched.whatsappId && Boolean(errors.whatsappId)}
                    helperText={touched.whatsappId && errors.whatsappId}
                    variant="outlined"
                    margin="dense"
                    style={{
                      width: "100%",
                      paddingRight: 10,
                      paddingBottom: 10,
                    }}
                  >
                    {whatsApps?.map((whatsapp) => (
                      <MenuItem key={whatsapp.id} value={`${whatsapp.id}`}>
                        {whatsapp.name}
                      </MenuItem>
                    ))}
                    {whatsappsApis.map((whatsapp) => (
                      <MenuItem key={whatsapp.id} value={`api-${whatsapp.id}`}>
                        {whatsapp?.name}
                      </MenuItem>
                    ))}
                  </Field>
                </Box>
                <Box className={classes.testContainer}>
                  <Typography variant="h6">
                    {i18n.t("macros.modal.form.testMessage")}
                  </Typography>
                  <Box className={classes.numberTestContainer}>
                    <TextField
                      className={classes.inputTest}
                      placeholder={i18n.t(
                        "macros.modal.form.testNumberPlaceholder"
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
                      {i18n.t("macros.modal.form.testButton")}
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
                    {i18n.t("macros.buttons.close")}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={submittingForm}
                    variant="contained"
                  >
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {macroId
                        ? i18n.t("macros.buttons.editMacro")
                        : i18n.t("macros.buttons.saveMacro")}
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
