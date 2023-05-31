import React from "react";
import { makeStyles } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";

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
  secondWayContactsListContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0",
    maxHeight: "68px",
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

const ListParticipants = ({
  participants,
  filterModalOpen,
  handleDelete,
  RemoveNewParticipantsModal = false,
}) => {
  const classes = useStyles();
  return (
    <div
      className={
        !RemoveNewParticipantsModal
          ? classes.contactsListContainer
          : classes.secondWayContactsListContainer
      }
      style={!filterModalOpen ? { display: "flex" } : { display: "none" }}
    >
      {participants.map((contact) => {
        return (
          <div key={contact.id} className={classes.contact}>
            <span className={classes.contactName}>{contact.name}</span>
            <DeleteOutline
              className={classes.deleteButton}
              onClick={() =>
                handleDelete({
                  contactId: contact.id,
                  contactNumber: contact.number,
                })
              }
              color="secondary"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ListParticipants;
