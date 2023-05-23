import React, { useEffect } from "react";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";

import {
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  autoComplete: {
    width: 300,
  },
  maxWidth: {
    width: "100%",
  },
}));

const filter = createFilterOptions({
  trim: true,
});

const CreateNewTicket = ({
  options,
  loading,
  searchParam,
  setSelectedContact,
  setNewContact,
  setContactModalOpen,
  setSearchParam,
  selectedContact,
  handleSaveTicket,
  selectedQueue,
  setSelectedQueue,
  user,
  handleClose,
  setShowCreateTicketForm,
}) => {
  const classes = useStyles();

  useEffect(() => {
    return () => {
      setShowCreateTicketForm(false);
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

  return (
    <>
      <DialogTitle id="form-dialog-title">
        {i18n.t("newTicketModal.title")}
      </DialogTitle>
      <FormControl>
        <DialogContent dividers>
          <Autocomplete
            options={options}
            loading={loading}
            style={{ width: 300 }}
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
                autoFocus
                required
                onChange={(e) => setSearchParam(e.target.value)}
                onKeyPress={(e) => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleSaveTicket(selectedContact.id);
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
          <DialogContent />

          <FormControl variant="outlined" className={classes.maxWidth}>
            <InputLabel>{i18n.t("ticketsList.acceptModal.queue")}</InputLabel>
            <Select
              autoHighlight
              required
              value={selectedQueue}
              className={classes.autoComplete}
              onChange={(e) => setSelectedQueue(e.target.value)}
              label={i18n.t("ticketsList.acceptModal.queue")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {user.queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
      </FormControl>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
          disabled={loading}
          variant="outlined"
        >
          {i18n.t("newTicketModal.buttons.cancel")}
        </Button>
        <ButtonWithSpinner
          variant="contained"
          type="button"
          disabled={!selectedContact || !selectedQueue}
          onClick={() => handleSaveTicket(selectedContact.id)}
          color="primary"
          loading={loading}
        >
          {i18n.t("newTicketModal.buttons.ok")}
        </ButtonWithSpinner>
      </DialogActions>
    </>
  );
};

export default CreateNewTicket;
