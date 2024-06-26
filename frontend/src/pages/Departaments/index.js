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
  Typography,
} from "@material-ui/core";
import Chip from "@material-ui/core/Chip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import DepartamentModal from "../../components/DepartamentModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";

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
  if (action.type === "LOAD_DEPARTAMENT") {
    const departaments = action.payload;
    const newDepartament = [];
    departaments.forEach((departament) => {
      const departamentIndex = state.findIndex((q) => q.id === departament.id);
      if (departamentIndex !== -1) {
        state[departamentIndex] = departament;
      } else {
        newDepartament.push(departament);
      }
    });
    return [...state, ...newDepartament];
  }

  if (action.type === "UPDATE_DEPARTAMENT") {
    const departament = action.payload;
    const departamentIndex = state.findIndex((u) => u.id === departament.id);
    if (departamentIndex !== -1) {
      state[departamentIndex] = departament;
      return [...state];
    } else {
      return [departament, ...state];
    }
  }

  if (action.type === "DELETE_DEPARTAMENT") {
    const departamentId = action.payload;
    const departamentIndex = state.findIndex((q) => q.id === departamentId);
    if (departamentIndex !== -1) {
      state.splice(departamentIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Departaments = () => {
  const classes = useStyles();

  const [departaments, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [departamentModalOpen, setDepartamentModalOpen] = useState(false);
  const [selectedDepartament, setSelectedDepartament] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/departament");
        dispatch({ type: "LOAD_DEPARTAMENT", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("departament", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_DEPARTAMENT", payload: data.departament });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_DEPARTAMENT", payload: data.departamentId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenQueueModal = () => {
    setDepartamentModalOpen(true);
    setSelectedDepartament(null);
  };

  const handleCloseQueueModal = () => {
    setDepartamentModalOpen(false);
    setSelectedDepartament(null);
  };

  const handleEditDepartament = (departament) => {
    setSelectedDepartament(departament);
    setDepartamentModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedDepartament(null);
  };

  const handleDeleteDepartament = async (departamentId) => {
    try {
      await api.delete(`/departament/${departamentId}`);
      toast.success(i18n.t("departaments.notifications.departamentDeleted"));
    } catch (err) {
      toastError(err);
    }
    setSelectedDepartament(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
            selectedDepartament &&
          `${i18n.t("departaments.confirmationModal.deleteTitle")} ${
            selectedDepartament.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteDepartament(selectedDepartament.id)}
      >
        {i18n.t("departaments.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <DepartamentModal
        open={departamentModalOpen}
        onClose={handleCloseQueueModal}
        departamentId={selectedDepartament?.id}
      />
      <MainHeader>
        <Title>{i18n.t("departaments.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenQueueModal}
          >
            {i18n.t("departaments.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("departaments.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("departaments.table.description")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("departaments.table.queues")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("departaments.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {departaments?.map((departament) => (
                <TableRow key={departament.id}>
                  <TableCell align="center">{departament.name}</TableCell>
                  <TableCell align="center">
                    <div className={classes.customTableCell}>
                      <Typography
                        style={{ width: 200, align: "center" }}
                        noWrap
                        variant="body2"
                      >
                        {departament.description}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <div className={classes.customQueueTableCell}>
                      <Typography
                        style={{ width: 600, align: "center"}}
                        variant="body2"
                      >
                        {
                            departament.queues?.map((queue, index) => 
                                <Chip
                                    key={index}
                                    style={{ backgroundColor: queue.color }}
                                    variant="outlined"
                                    label={queue.name}
                                    className={classes.chip}
                                />
                            )
                        }
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditDepartament(departament)}
                    >
                      <Edit color="secondary" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDepartament(departament);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline color="secondary" />
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

export default Departaments;
