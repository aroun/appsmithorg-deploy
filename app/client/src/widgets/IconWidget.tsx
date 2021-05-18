import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "./BaseWidget";
import { WidgetType, WidgetTypes } from "constants/WidgetConstants";
import IconComponent, {
  IconType,
} from "components/designSystems/blueprint/IconComponent";
import {
  EventType,
  ExecutionResult,
} from "constants/AppsmithActionConstants/ActionConstants";
import { VALIDATION_TYPES } from "constants/WidgetValidation";
import * as Sentry from "@sentry/react";

export const IconSizes: { [key: string]: number } = {
  LARGE: 32,
  SMALL: 12,
  DEFAULT: 16,
};

class IconWidget extends BaseWidget<IconWidgetProps, WidgetState> {
  static getPropertyPaneConfig() {
    return [
      {
        sectionName: "General",
        children: [
          {
            propertyName: "iconName",
            label: "Icon Name",
            helpText: "Set name of the icon.",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter icon name",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.TEXT,
          },
          {
            propertyName: "isVisible",
            helpText: "Controls the visibility of the widget",
            label: "Visible",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: VALIDATION_TYPES.BOOLEAN,
          },
        ],
      },
      {
        sectionName: "Styles",
        children: [
          {
            propertyName: "color",
            label: "Icon Color",
            controlType: "COLOR_PICKER",
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            propertyName: "iconSize",
            label: "Icon Size",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "Default",
                value: IconSizes.DEFAULT,
                subText: `${IconSizes.DEFAULT}px`,
              },
              {
                label: "Small",
                value: IconSizes.SMALL,
                subText: `${IconSizes.SMALL}px`,
              },
              {
                label: "Large",
                value: IconSizes.LARGE,
                subText: `${IconSizes.LARGE}px`,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
          },
        ],
      },
      {
        sectionName: "Actions",
        children: [
          {
            propertyName: "onClick",
            label: "onClick",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable @typescript-eslint/no-empty-function */
  handleActionResult = (result: ExecutionResult) => {};

  onClick = () => {
    if (this.props.onClick) {
      super.executeAction({
        triggerPropertyName: "onClick",
        dynamicString: this.props.onClick,
        event: {
          type: EventType.ON_CLICK,
          callback: this.handleActionResult,
        },
      });
    }
  };

  getPageView() {
    return (
      <IconComponent
        color={this.props.color}
        disabled={this.props.disabled}
        iconName={this.props.iconName}
        iconSize={this.props.iconSize}
        onClick={this.onClick}
      />
    );
  }

  getWidgetType(): WidgetType {
    return WidgetTypes.ICON_WIDGET;
  }
}

export type IconSize = typeof IconSizes[keyof typeof IconSizes] | undefined;

export interface IconWidgetProps extends WidgetProps {
  iconName: IconType;
  onClick: string;
  iconSize: IconSize;
  color: string;
}

export default IconWidget;
export const ProfiledIconWidget = Sentry.withProfiler(IconWidget);
