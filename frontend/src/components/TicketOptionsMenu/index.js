import React, { useContext, useEffect, useRef, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import AddNewParticipantsModal from "../AddNewParticipantsModal";
import RemoveNewParticipantsModal from "../RemoveNewParticipantsModal";
import EditGroupModal from "../EditGroupModal";

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [showAddParticipantsModal, setShowAddParticipantsModal] =
    useState(false);
  const [showRemoveParticipantsModal, setShowRemoveParticipantsModal] =
    useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  return (
    <>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        <MenuItem onClick={handleOpenTransferModal}>
          {i18n.t("ticketOptionsMenu.transfer")}
        </MenuItem>
        <Can
          role={user.profile}
          perform="ticket-options:deleteTicket"
          yes={() => (
            <MenuItem onClick={handleOpenConfirmationModal}>
              {i18n.t("ticketOptionsMenu.delete")}
            </MenuItem>
          )}
        />
        {ticket?.isGroup ? (
          <>
            <MenuItem onClick={() => setShowAddParticipantsModal(true)}>
              Adicionar participante
            </MenuItem>
            <MenuItem onClick={() => setShowRemoveParticipantsModal(true)}>
              Remover participante
            </MenuItem>
            <MenuItem onClick={() => setShowEditGroupModal(true)}>
              Editar grupo
            </MenuItem>
          </>
        ) : null}
      </Menu>
      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
          ticket.id
        } ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
          ticket.contact.name
        }?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <TransferTicketModal
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />
      {showAddParticipantsModal ? (
        <AddNewParticipantsModal
          showAddParticipantsModal={showAddParticipantsModal}
          setShowAddParticipantsModal={setShowAddParticipantsModal}
          user={user}
          ticket={ticket}
        />
      ) : null}
      {showRemoveParticipantsModal ? (
        <RemoveNewParticipantsModal
          showRemoveParticipantsModal={showRemoveParticipantsModal}
          setShowRemoveParticipantsModal={setShowRemoveParticipantsModal}
          ticket={ticket}
        />
      ) : null}
      {showEditGroupModal ? (
        <EditGroupModal
          showEditGroupModal={showEditGroupModal}
          setShowEditGroupModal={setShowEditGroupModal}
          ticket={ticket}
        />
      ) : null}
    </>
  );
};

export default TicketOptionsMenu;
