import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

// import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import CreateNewTicket from "../CreateNewTicket";
import CreateGroupModal from "../CreateGroupModal";

const NewTicketModal = ({ modalOpen, onClose }) => {
  const history = useHistory();

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({});
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchContacts();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedContact(null);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user.id,
        status: "open",
        queueId: selectedQueue,
      });
      history.push(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    handleClose();
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = (contact) => {
    handleSaveTicket(contact.id);
  };

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={handleCloseContactModal}
        onSave={handleAddNewContactTicket}
      />
      <Dialog open={modalOpen} onClose={handleClose}>
        {!showCreateTicketForm && !showCreateGroup ? (
          <>
            <DialogTitle id="form-dialog-title">
              Escolha uma das opções abaixo
            </DialogTitle>
            <DialogContent deviders>
              <DialogActions>
                <Button
                  onClick={() => setShowCreateTicketForm(true)}
                  color="primary"
                  disabled={loading}
                  variant="outlined"
                >
                  Criar Ticket
                </Button>
                <Button
                  onClick={() => setShowCreateGroup(true)}
                  color="secondary"
                  disabled={loading}
                  variant="outlined"
                >
                  Criar Grupo
                </Button>
              </DialogActions>
            </DialogContent>
          </>
        ) : null}
        {showCreateTicketForm ? (
          <CreateNewTicket
            options={options}
            loading={loading}
            searchParam={searchParam}
            setSelectedContact={setSelectedContact}
            setNewContact={setNewContact}
            setContactModalOpen={setContactModalOpen}
            setSearchParam={setSearchParam}
            selectedContact={selectedContact}
            handleSaveTicket={handleSaveTicket}
            selectedQueue={selectedQueue}
            setSelectedQueue={setSelectedQueue}
            user={user}
            handleClose={handleClose}
            setShowCreateTicketForm={setShowCreateTicketForm}
          />
        ) : null}
        {showCreateGroup ? (
          <CreateGroupModal
            options={options}
            loading={loading}
            searchParam={searchParam}
            setSelectedContact={setSelectedContact}
            setNewContact={setNewContact}
            setContactModalOpen={setContactModalOpen}
            setSearchParam={setSearchParam}
            selectedContact={selectedContact}
            handleClose={handleClose}
            setShowCreateGroup={setShowCreateGroup}
          />
        ) : null}
      </Dialog>
    </>
  );
};

export default NewTicketModal;
