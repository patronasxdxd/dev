import React from "react";
import { Container } from "theme-ui";

type ModalProps = {
  children: React.ReactNode
}

export const Modal = ({ children }: ModalProps): JSX.Element => (
  <Container variant="modalOverlay">
    <Container variant="modal">{children}</Container>
  </Container>
);
