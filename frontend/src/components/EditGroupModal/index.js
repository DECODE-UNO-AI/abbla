import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React, { useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const EditGroupModal = ({
  showEditGroupModal,
  setShowEditGroupModal,
  ticket,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState("");

  const handleEditGroup = async () => {
    try {
      await api.put("/groups/editGroup", {
        groupName,
        groupImage: groupImage.startsWith("http") ? groupImage : null,
        groupId: ticket?.contact?.number,
        whatsappId: ticket?.whatsappId,
        contactId: ticket?.contactId,
      });
    } catch (error) {
      toastError(error);
    } finally {
      setGroupName("");
      setGroupImage("");
      setShowEditGroupModal(false);
    }
  };

  return (
    <Dialog
      open={showEditGroupModal}
      onClose={() => setShowEditGroupModal(false)}
    >
      <DialogTitle id="form-dialog-title">
        {i18n.t("groupTextField.editGroup")}
      </DialogTitle>
      <DialogContent style={{ overflowY: "hidden", width: "500px" }} dividers>
        <TextField
          style={{ width: "100%" }}
          label={i18n.t("groupTextField.labelInputGroupName")}
          variant="outlined"
          value={groupName}
          autoFocus
          required
          onChange={(e) => setGroupName(e.target.value)}
        />
      </DialogContent>
      <DialogContent
        style={{ display: "flex", justifyContent: "flex-end" }}
        dividers
      >
        <Button
          onClick={handleEditGroup}
          color="primary"
          variant="contained"
          disabled={groupName.length < 3}
        >
          {i18n.t("groupTextField.editGroup")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
