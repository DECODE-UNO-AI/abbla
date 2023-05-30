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
      <DialogTitle id="form-dialog-title">Editar grupo</DialogTitle>
      <DialogContent style={{ overflowY: "hidden" }} dividers>
        <TextField
          style={{ width: "100%", marginBottom: 20 }}
          label="Digite o nome do grupo"
          variant="outlined"
          value={groupName}
          autoFocus
          required
          onChange={(e) => setGroupName(e.target.value)}
        />

        <TextField
          style={{ width: "100%", marginBottom: 20 }}
          label="Digite o link para a nova imagem do grupo"
          variant="outlined"
          value={groupImage}
          onChange={(e) => setGroupImage(e.target.value)}
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
          Editar grupo
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
