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

const reducer = (state, action) => {
  if (action.type === "LOAD_MACROS") {
    const macros = action.payload;
    return [...state, ...macros];
  }

  // if (action.type === "UPDATE_MACROS") {
  //   const macros = action.payload;
  //   const campaignIndex = state.findIndex((u) => u.id === campaign.id);
  //   if (campaignIndex !== -1) {
  //     state[campaignIndex] = campaign;
  //     return [...state];
  //   } else {
  //     return [campaign, ...state];
  //   }
  // }

  // if (action.type === "DELETE_CAMPAIGNS") {
  //   const campaignId = action.payload;
  //   const campaignIndex = state.findIndex((q) => q.id === +campaignId);
  //   if (campaignIndex !== -1) {
  //     state.splice(campaignIndex, 1);
  //   }
  //   return [...state];
  // }

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
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.macro });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGNS", payload: data.campaignId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOnCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Adicionar Macros"
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
      >
        {i18n.t("campaigns.confirmationModal.archiveMessage")}
      </ConfirmationModal>
      <MacroModal
        open={modalOpen}
        onClose={handleOnCloseModal}
        visualize={visualizeModal}
      />
      <MainHeader>
        <Title>Macros</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setVisualizeModal(false);
              setModalOpen(true);
            }}
          >
            Adicionar Macro
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
    </MainContainer>
  );
};

export default Macros;
