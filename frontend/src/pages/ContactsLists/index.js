import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';


import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import ViewContactList from "../../components/ViewContactList";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { FolderOutlined  } from "@material-ui/icons";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import ContactListModal from "../../components/ContactListModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  customQueueTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_LIST") {
    const lists = action.payload;
    const newList = [];
    lists.forEach((list) => {
      const listIndex = state.findIndex((q) => q.id === list.id);
      if (listIndex !== -1) {
        state[listIndex] = list;
      } else {
        newList.push(list);
      }
    });
    return [...state, ...newList];
  }

  if (action.type === "UPDATE_LIST") {
    const list = action.payload;
    const listIndex = state.findIndex((u) => u.id === list.id);
    if (listIndex !== -1) {
      state[listIndex] = list;
      return [...state];
    } else {
      return [list, ...state];
    }
  }

  if (action.type === "DELETE_LIST") {
    const contactListId = action.payload;
    const listIndex = state.findIndex((q) => q.id === +contactListId);
    if (listIndex !== -1) {
      state.splice(listIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const ContactsLists = () => {
  const classes = useStyles();

  const [contactsList, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [contactsListModalOpen, setContactListModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/campaigncontactslist");
        dispatch({ type: "LOAD_LIST", payload: data.lists });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("contactsList", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_LIST", payload: data.contactList });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_LIST", payload: data.contactListId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleContactListOpen = () => {
    setContactListModalOpen(true);
    setSelectedList(null);
  };

  const handleViewList = (list) => {
    setSelectedList(list)
    setShowContactsList(true);
  }

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedList(null);
  };

  const handleArchiveList = async (listId) => {
    try {
      await api.delete(`/campaigncontactslist/${listId}`);
      toast.success("Lista arquivada!");
    } catch (err) {
      toastError(err);
    }
    setSelectedList(null);
  };

  const activedContactsList = contactsList.filter(list => list.actived === true)

  return (
    <MainContainer>
      <ContactListModal open={contactsListModalOpen} onClose={() => setContactListModalOpen(false)}/>
      <ConfirmationModal
        title={
            selectedList &&
          `Arquivar ${
            selectedList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleArchiveList(selectedList.id)}
      >
        Ao arquivar a lista não sera possível criar novas campanhas a partir da mesma, tem certeza que deseja arquivar?
      </ConfirmationModal>
      <ViewContactList isOpen={showContactsList} setIsOpen={setShowContactsList} selectedListId={selectedList ? selectedList.id : null} />
      <MainHeader>
        <Title>Listas de contatos</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleContactListOpen}
          >
            Adicionar lista
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">
                ID
              </TableCell>
              <TableCell align="center">
                {i18n.t("departaments.table.name")}
              </TableCell>
              <TableCell align="center">
                Criado em
              </TableCell>
              <TableCell align="center">
                {i18n.t("departaments.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {activedContactsList?.map((list) => (
                <TableRow key={list.id}>
                  <TableCell align="left">{list.id}</TableCell>
                  <TableCell align="center">
                    {list.name}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(list.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewList(list)}
                    >
                      <RemoveRedEye color="secondary" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedList(list);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <FolderOutlined color="secondary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ContactsLists;
