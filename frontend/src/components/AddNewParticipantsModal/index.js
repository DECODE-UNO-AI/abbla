import React from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  Button,
  CircularProgress,
  TextField,
  makeStyles,
} from "@material-ui/core";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import FilterComponent from "../FilterComponent";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { DeleteOutline } from "@material-ui/icons";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const filter = createFilterOptions({
  trim: true,
});

const useStyles = makeStyles((theme) => ({
  contactsListContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0",
    padding: "5px 24px",
    maxHeight: "68px",
    overflowY: "scroll",
    overflowX: "hidden",
  },
  contact: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid black",
    padding: "3px",
    margin: "3px",
  },
  deleteButton: {
    cursor: "pointer",
  },
  alertText: {
    width: "100%",
    fontSize: "16px",
    color: "red",
    textAlign: "center",
  },
}));

const AddNewParticipantsModal = ({
  showAddParticipantsModal,
  setShowAddParticipantsModal,
  user,
  ticket,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearInput, setClearInput] = useState(true);
  const [adminFilterOptions, setAdminFilterOptions] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [width, setWidth] = useState("34px");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchParam, setSearchParam] = useState("");
  const [participants, setParticipants] = useState([]);
  const [groupParticipants, setGroupParticipants] = useState([]);
  const [newContact, setNewContact] = useState(null);
  const [hasParticipants, setHasParticipants] = useState(false);
  const [showTextAlert, setShowTextAlert] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    if (!ticket.whatsappId) return;

    const fetchParticipants = async () => {
      try {
        const result = await api.post("/groups/participants", {
          groupId: ticket?.contact?.number,
          whatsappId: ticket?.whatsappId,
        });

        setHasParticipants(true);
        setGroupParticipants([...result?.data?.participants]);
      } catch (err) {
        toastError(err);
      }
    };

    fetchParticipants();
  }, []);

  useEffect(() => {
    if (showTextAlert) {
      setTimeout(() => {
        return setShowTextAlert(false);
      }, 3000);
    }
  }, [showTextAlert]);

  useEffect(() => {
    if (newContact) setParticipants([...participants, newContact]);
  }, [newContact]);

  useEffect(() => {
    if (!showAddParticipantsModal || searchParam.length < 3) {
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
  }, [searchParam, showAddParticipantsModal]);

  const addParticipantsToGroup = async () => {
    try {
      await api.post("/groups/addParticipants", {
        groupId: ticket?.contact?.number,
        participants: participants,
        whatsappId: ticket?.whatsappId,
      });
    } catch (error) {
      toastError(error);
    } finally {
      setShowAddParticipantsModal(false);
    }
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
    }
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);

    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }

    return filtered;
  };

  const renderOption = (option) => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const handleDeleteContactFromList = (contactId) => {
    const newContacts = participants.filter(
      (contact) => contact.id !== contactId
    );

    setParticipants(newContacts);
  };

  const handleParticipants = () => {
    setClearInput(!clearInput);
    const isInGroup = groupParticipants.some(
      (participant) =>
        Number(participant.number) === Number(selectedContact.number)
    );

    if (isInGroup) {
      return setShowTextAlert(true);
    }

    setParticipants([
      ...participants,
      {
        id: selectedContact?.id,
        name: selectedContact?.name,
        number: selectedContact?.number,
      },
    ]);
  };

  return (
    <Dialog
      open={showAddParticipantsModal}
      onClose={() => setShowAddParticipantsModal(false)}
    >
      <DialogTitle id="form-dialog-title">Adicionar Participante</DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          options={options}
          loading={loading}
          style={{ width: "100%" }}
          key={clearInput}
          clearOnBlur
          autoHighlight
          freeSolo
          clearOnEscape
          getOptionLabel={renderOptionLabel}
          renderOption={renderOption}
          filterOptions={createAddContactOption}
          onChange={(e, newValue) => handleSelectOption(e, newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("newTicketModal.fieldLabel")}
              variant="outlined"
              required
              onChange={(e) => setSearchParam(e.target.value)}
              onKeyPress={(e) => {
                if (loading || !selectedContact) return;
                else if (e.key === "Enter") {
                  handleParticipants();
                }
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />
      </DialogContent>
      {showTextAlert ? (
        <p className={classes.alertText}>Contato já está no grupo</p>
      ) : null}
      {participants.length > 0 ? (
        <div
          className={classes.contactsListContainer}
          style={!filterModalOpen ? { display: "flex" } : { display: "none" }}
        >
          {participants.map((contact) => {
            return contact.name ? (
              <div key={contact.id} className={classes.contact}>
                <span className={classes.contactName}>{contact.name}</span>
                <DeleteOutline
                  className={classes.deleteButton}
                  onClick={() => handleDeleteContactFromList(contact.id)}
                  color="secondary"
                />
              </div>
            ) : null;
          })}
        </div>
      ) : null}
      <DialogActions>
        {user?.profile === "admin" || user?.profile === "supervisor" ? (
          <div
            style={
              width !== "34px"
                ? {
                    width: width,
                    height: "651px",
                    backgroundColor: "transparent",
                  }
                : null
            }
          >
            <FilterComponent
              user={user}
              onSubmit={setAdminFilterOptions}
              calledByGroupCreator
              setWidth={setWidth}
              setFilterModalOpen={setFilterModalOpen}
            />
          </div>
        ) : null}

        <ButtonWithSpinner
          style={!filterModalOpen ? { display: "flex" } : { display: "none" }}
          variant="contained"
          type="button"
          disabled={!selectedContact}
          onClick={() => handleParticipants()}
          color="primary"
          loading={loading}
        >
          Adicionar ao Grupo
        </ButtonWithSpinner>
        <Button
          style={!filterModalOpen ? { display: "flex" } : { display: "none" }}
          onClick={addParticipantsToGroup}
          color="secondary"
          disabled={!hasParticipants || participants.length === 0}
          variant="outlined"
        >
          Adicionar participante(s)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewParticipantsModal;
