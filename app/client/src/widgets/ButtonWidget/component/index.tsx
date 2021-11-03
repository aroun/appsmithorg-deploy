import { apply, tw } from "twind";
import React, { useMemo } from "react";
import styled from "styled-components";
import { IButtonProps, Position } from "@blueprintjs/core";
import tinycolor from "tinycolor2";
import { IconName } from "@blueprintjs/icons";

import Tooltip from "components/ads/Tooltip";
import { ComponentProps } from "widgets/BaseComponent";

import { Colors } from "../../../constants/Colors";
import _ from "lodash";
import BaseButton from "./BaseButton";
import { RecaptchaProps, BtnWrapper } from "./RecaptchaComponent";
import { ButtonComponentProps, ButtonType } from "./types";

const ToolTipWrapper = styled.div`
  height: 100%;
  && .bp3-popover-target {
    height: 100%;
    & > div {
      height: 100%;
    }
  }
`;

// To be used with the canvas
function ButtonComponent(props: ButtonComponentProps & RecaptchaProps) {
  const btnWrapper = (
    <BtnWrapper
      clickWithRecaptcha={props.clickWithRecaptcha}
      googleRecaptchaKey={props.googleRecaptchaKey}
      handleRecaptchaV2Loading={props.handleRecaptchaV2Loading}
      onClick={props.onClick}
      recaptchaV2={props.recaptchaV2}
    >
      <div className="flex items-center justify-content-center h-full">
        <BaseButton {...props} />
      </div>
    </BtnWrapper>
  );

  if (props.tooltip) {
    return (
      <ToolTipWrapper>
        <Tooltip
          content={props.tooltip}
          disabled={props.isDisabled}
          hoverOpenDelay={200}
          position={Position.TOP}
        >
          {btnWrapper}
        </Tooltip>
      </ToolTipWrapper>
    );
  } else {
    return btnWrapper;
  }
}

export { ButtonType, BaseButton };
export default ButtonComponent;
