import React, { useEffect, useReducer, useState } from "react";
import MainContainer from "../../components/MainContainer";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { Button } from "@material-ui/core";
import MacroModal from "../../components/MacroModal";
import openSocket from "../../services/socket-io";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import MacroTable from "../../components/MacroTable";

const reducer = (state, action) => {
  if (action.type === "LOAD_MACROS") {
    const macros = action.payload;
    return [...state, ...macros];
  }

  if (action.type === "UPDATE_MACROS") {
    const macros = action.payload;
    const macrosIndex = state.findIndex((u) => u.id === macros.id);
    if (macrosIndex !== -1) {
      state[macrosIndex] = macros;
      return [...state];
    } else {
      return [...state, macros];
    }
  }

  if (action.type === "DELETE_MACRO") {
    const macroId = action.payload;
    const macroIndex = state.findIndex((q) => q.id === +macroId);
    if (macroIndex !== -1) {
      state.splice(macroIndex, 1);
    }
    return [...state];
  }

  // if (action.type === "RESET") {
  //   return [];
  // }
};

const Macros = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [visualizeModal, setVisualizeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [macros, dispatch] = useReducer(reducer, []);
  const [selectedMacro, setSelectedMacro] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/macros");
        dispatch({ type: "LOAD_MACROS", payload: data });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("macros", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_MACROS", payload: data.macro });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_MACRO", payload: data.macroId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOnCloseModal = () => {
    setModalOpen(false);
    setSelectedMacro(null);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
  };

  const handleEditMacro = (macro) => {
    setVisualizeModal(false);
    setSelectedMacro(macro);
    setModalOpen(true);
  };

  const handleDeleteMacro = async (macroId) => {
    setLoading(true);
    try {
      await api.delete(`/macros/${macroId}`);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toastError(error);
    }
  };

  return (
    <MainContainer>
      <MacroModal
        open={modalOpen}
        onClose={handleOnCloseModal}
        visualize={visualizeModal}
        macroId={selectedMacro?.id}
      />
      <MainHeader>
        <Title>{i18n.t("macros.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setVisualizeModal(false);
              setModalOpen(true);
            }}
          >
            {i18n.t("macros.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MacroTable
        macros={macros}
        loading={loading}
        handleEditMacro={handleEditMacro}
        handleDeleteMacro={handleDeleteMacro}
      />
    </MainContainer>
  );
};

export default Macros;
