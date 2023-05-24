import React, { useState, useEffect } from "react";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import ButtonWithSpinner from "../ButtonWithSpinner";
import CircularProgress from "@material-ui/core/CircularProgress";
import { DeleteOutline } from "@material-ui/icons";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { i18n } from "../../translate/i18n";

import { FormControl, makeStyles } from "@material-ui/core";

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
}));

const filter = createFilterOptions({
  trim: true,
});

const CreateGroupModal = ({
  options,
  loading,
  searchParam,
  setSelectedContact,
  setNewContact,
  setContactModalOpen,
  setSearchParam,
  selectedContact,
  handleClose,
  setShowCreateGroup,
}) => {
  const [groupName, setGroupName] = useState("");
  const [contacts, setContacts] = useState([]);
  const [clearInput, setClearInput] = useState(true);
  const classes = useStyles();

  useEffect(() => {
    return () => {
      setShowCreateGroup(false);
      setContacts([]);
    };
  }, []);

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
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

  const handleCreateGroup = () => {
    console.log("creating...");
    handleClose();
  };

  const handleDeleteContactFromList = (contactId) => {
    const newContacts = contacts.filter((contact) => contact.id !== contactId);

    setContacts(newContacts);
  };

  return (
    <>
      <DialogTitle id="form-dialog-title">Criar Grupo</DialogTitle>
      <FormControl>
        <DialogContent dividers>
          <TextField
            style={{ width: 300, marginBottom: 20 }}
            label="Digite o nome do grupo"
            variant="outlined"
            autoFocus
            required
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Autocomplete
            options={options}
            loading={loading}
            style={{ width: 300 }}
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
                    setClearInput(!clearInput);
                    setContacts([
                      ...contacts,
                      {
                        id: selectedContact?.id,
                        name: selectedContact?.name,
                        number: selectedContact?.number,
                      },
                    ]);
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
      </FormControl>
      {contacts.length > 0 ? (
        <div className={classes.contactsListContainer}>
          {contacts.map((contact) => {
            return (
              <div key={contact.id} className={classes.contact}>
                <span className={classes.contactName}>{contact.name}</span>
                <DeleteOutline
                  className={classes.deleteButton}
                  onClick={() => handleDeleteContactFromList(contact.id)}
                  color="secondary"
                />
              </div>
            );
          })}
        </div>
      ) : null}
      <DialogActions>
        <ButtonWithSpinner
          variant="contained"
          type="button"
          disabled={!selectedContact}
          onClick={() => {
            setClearInput(!clearInput);
            setContacts([
              ...contacts,
              {
                id: selectedContact?.id,
                name: selectedContact?.name,
                number: selectedContact?.number,
              },
            ]);
          }}
          color="primary"
          loading={loading}
        >
          Adicionar ao Grupo
        </ButtonWithSpinner>
        <Button
          onClick={handleCreateGroup}
          color="secondary"
          disabled={loading}
          variant="outlined"
        >
          Finalizar
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateGroupModal;
