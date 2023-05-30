import React, { useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Button, makeStyles } from "@material-ui/core";
import api from "../../services/api";
import ListParticipants from "../ListParticipants";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  alertText: {
    width: "100%",
    fontSize: "16px",
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
}));

const RemoveNewParticipantsModal = ({
  showRemoveParticipantsModal,
  setShowRemoveParticipantsModal,
  ticket,
}) => {
  const [showTextAlert, setShowTextAlert] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsToBeRemoved, setParticipantsToBeRemoved] = useState([]);

  const classes = useStyles();

  useEffect(() => {
    if (showTextAlert) {
      setTimeout(() => {
        return setShowTextAlert(false);
      }, 3000);
    }
  }, [showTextAlert]);

  useEffect(() => {
    if (!ticket.whatsappId) return;

    const fetchParticipants = async () => {
      try {
        const result = await api.post("/groups/participants", {
          groupId: ticket?.contact?.number,
          whatsappId: ticket?.whatsappId,
        });
        setParticipants([...result?.data?.participants]);
      } catch (err) {
        toastError(err);
      }
    };

    fetchParticipants();
  }, []);

  const handleDeleteContactFromList = async ({ contactId, contactNumber }) => {
    setParticipantsToBeRemoved([
      ...participantsToBeRemoved,
      `${contactNumber}@c.us`,
    ]);
    const newContacts = participants.filter(
      (contact) => contact.id !== contactId
    );

    setParticipants(newContacts);
  };

  const handleRemoveParticipantsFromGroup = async () => {
    try {
      await api.post("/groups/removeParticipant", {
        contactIds: participantsToBeRemoved,
        groupId: ticket?.contact?.number,
        whatsappId: ticket?.whatsappId,
      });
    } catch (error) {
      toastError(error);
    } finally {
      setShowRemoveParticipantsModal(false);
    }
  };

  return (
    <Dialog
      open={showRemoveParticipantsModal}
      onClose={() => setShowRemoveParticipantsModal(false)}
    >
      <DialogTitle id="form-dialog-title">
        {i18n.t("groupTextField.removeParticipant")}
      </DialogTitle>
      <DialogContent dividers>
        {showTextAlert ? (
          <p className={classes.alertText}>
            {i18n.t("groupTextField.alertText")}
          </p>
        ) : null}
        {participants.length > 0 ? (
          <ListParticipants
            participants={participants}
            handleDelete={handleDeleteContactFromList}
            RemoveNewParticipantsModal
          />
        ) : null}
      </DialogContent>
      <DialogContent dividers>
        <Button
          onClick={handleRemoveParticipantsFromGroup}
          color="secondary"
          disabled={participantsToBeRemoved.length === 0}
          variant="outlined"
        >
          {i18n.t("groupTextField.removeParticipant")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveNewParticipantsModal;
