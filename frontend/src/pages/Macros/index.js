import React, { useState } from "react";
import MainContainer from "../../components/MainContainer";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { Button } from "@material-ui/core";
import MacroModal from "../../components/MacroModal";

const Macros = () => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [visualizeModal, setVisualizeModal] = useState(false);

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
