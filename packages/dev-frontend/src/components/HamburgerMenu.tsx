import React, { useState, useRef } from "react";
import { Container, Button } from "theme-ui";

import { Icon } from "./Icon";
import { Nav } from "./Nav";
import { NavPopUp } from "./NavPopUp";

export const HamburgerMenu = (): JSX.Element => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const sideBarOverlayRef = useRef<HTMLDivElement>(null);
  
  return (
    <>
      <Button
        onClick={() => setSideBarOpen(!sideBarOpen)}
        variant="icon"
        sx={{
          position: "relative",
          display: ["block", "none"]
        }}
      >
        <Icon name="bars" size="2x" />
      </Button>
      {sideBarOpen && (
        <Container
          variant="infoOverlay"
          ref={sideBarOverlayRef}
          onClick={e => {
            if (e.target === sideBarOverlayRef.current) {
              setSideBarOpen(false);
            }
          }}
        >
          <NavPopUp>
            <Nav />
          </NavPopUp>
        </Container>
      )}
    </>
  );
};
