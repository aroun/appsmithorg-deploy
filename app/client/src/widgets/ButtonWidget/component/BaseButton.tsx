import { apply, tw } from "twind";
import tinycolor from "tinycolor2";
import React, { useMemo } from "react";

import { Colors } from "constants/Colors";
import { ButtonVariantTypes } from "components/constants";

import { BaseButtonProps } from "./types";

export default function BaseButton(props: BaseButtonProps) {
  const { borderRadius, buttonColor, disabled, text } = props;

  /**
   * returns the text color based on the button bg
   */
  const textColor = useMemo(() => {
    if (!buttonColor) return "white";
    const isDark = tinycolor(buttonColor).isDark();
    if (isDark) {
      return "white";
    }
    return "gray-900";
  }, [buttonColor]);

  const children = useMemo(() => {
    return text;
  }, [text]);

  const baseStyles = apply`w-full h-full text`;
  const widgetStyles = apply`bg-[${buttonColor}] rounded-${borderRadius} text-${textColor}`;
  const disableStyles = disabled && apply`bg-gray-300 text-white`;

  const computedStyles = tw`${baseStyles} ${widgetStyles} ${disableStyles}`;

  return <button className={computedStyles}>{children}</button>;
}

BaseButton.defaultProps = {
  buttonColor: Colors.GREEN,
  buttonVariant: ButtonVariantTypes.PRIMARY,
  disabled: false,
  text: "Button Text",
  minimal: true,
};
