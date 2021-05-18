import React from "react";
import { Icon, Intent } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import styled from "styled-components";
import { noop } from "utils/AppsmithUtils";

const IconWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
class IconComponent extends React.Component<IconComponentProps> {
  render = () => (
    <IconWrapper>
      <Icon
        color={this.props.color}
        icon={this.props.iconName as IconName}
        iconSize={this.props.iconSize}
        intent={this.props.intent}
        onClick={this.props.disabled ? noop : this.props.onClick}
        style={{
          cursor:
            this.props.onClick && !this.props.disabled ? "pointer" : "auto",
        }}
      />
    </IconWrapper>
  );
}

export type IconType = IconName | string;

export interface IconComponentProps {
  iconSize?: number;
  iconName?: IconType;
  intent?: Intent;
  disabled?: boolean;
  onClick?: () => void;
  color: string;
}

export default IconComponent;
