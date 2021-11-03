import { IconName } from "@blueprintjs/icons";
import { MaybeElement, Alignment } from "@blueprintjs/core";

import {
  ButtonBoxShadow,
  ButtonBorderRadius,
  ButtonVariant,
} from "components/constants";
import { ComponentProps } from "widgets/BaseComponent";

export enum ButtonType {
  SUBMIT = "submit",
  RESET = "reset",
  BUTTON = "button",
}

export interface ButtonComponentProps extends ComponentProps {
  text?: string;
  icon?: IconName | MaybeElement;
  tooltip?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isDisabled?: boolean;
  isLoading: boolean;
  rightIcon?: IconName | MaybeElement;
  type: ButtonType;
  buttonColor?: string;
  buttonVariant?: ButtonVariant;
  borderRadius?: ButtonBorderRadius;
  boxShadow?: ButtonBoxShadow;
  boxShadowColor?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
}

export type BaseButtonProps = {
  buttonColor?: string;
  buttonVariant?: ButtonVariant;
  boxShadow?: ButtonBoxShadow;
  boxShadowColor?: string;
  borderRadius?: ButtonBorderRadius;
  iconName?: IconName;
  iconAlign?: Alignment;
  disabled?: boolean;
  text?: string;
  loading?: boolean;
  onClick?: any;
};
