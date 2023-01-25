import React from "react";
import Tippy, { TippyProps } from "@tippyjs/react";
import { Icon } from "./Icon";
import { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

export type InfoIconProps = Pick<TippyProps, "placement"> &
  Pick<FontAwesomeIconProps, "size"> & {
    tooltip: React.ReactNode;
  };

export const InfoIcon = ({ placement = "right", tooltip, size = "1x" }: InfoIconProps): JSX.Element => {
  return (
    <Tippy interactive={true} placement={placement} content={tooltip} maxWidth="268px">
      <span>
        &nbsp;
        <Icon name="question-circle" size={size} />
      </span>
    </Tippy>
  );
};
