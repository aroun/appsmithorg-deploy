import { useMemo } from "react";
import { useHotkeys } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";

import {
  cutWidget,
  copyWidget,
  pasteWidget,
  deleteSelectedWidget,
} from "actions/widgetActions";
import {
  WIDGETS_SEARCH_ID,
  ENTITY_EXPLORER_SEARCH_ID,
} from "constants/Explorer";
import { AppState } from "reducers";
import { isMac } from "utils/helpers";
import { getSelectedWidget } from "selectors/ui";
import { getSelectedText } from "utils/helpers";
import { MAIN_CONTAINER_WIDGET_ID } from "constants/WidgetConstants";

const useEditorHotKeys = () => {
  const dispatch = useDispatch();
  const selectedWidget = useSelector<AppState, string | undefined>(
    getSelectedWidget,
  );

  /**
   * stop propagation of keyboard events up the dom tree when
   * a widget is selected
   */
  const stopPropagationIfWidgetSelected = (e: KeyboardEvent): boolean => {
    if (
      selectedWidget &&
      selectedWidget != MAIN_CONTAINER_WIDGET_ID &&
      !getSelectedText()
    ) {
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    return false;
  };

  const hotkeys = useMemo(
    () => [
      {
        global: true,
        combo: "mod + f",
        label: "Search entities",
        onKeyDown: (e: any) => {
          const entitySearchInput = document.getElementById(
            ENTITY_EXPLORER_SEARCH_ID,
          );
          const widgetSearchInput = document.getElementById(WIDGETS_SEARCH_ID);
          if (entitySearchInput) entitySearchInput.focus();
          if (widgetSearchInput) widgetSearchInput.focus();
          e.preventDefault();
          e.stopPropagation();
        },
      },
      {
        global: true,
        combo: "mod + c",
        label: "Copy Widget",
        group: "Canvas",
        onKeyDown: (e: any) => {
          if (stopPropagationIfWidgetSelected(e)) {
            dispatch(copyWidget(true));
          }
        },
      },
      {
        global: true,
        combo: "mod + v",
        label: "Paste Widget",
        group: "Canvas",
        onKeyDown: () => {
          dispatch(pasteWidget());
        },
      },
      {
        global: true,
        combo: "backspace",
        label: "Delete Widget",
        group: "Canvas",
        onKeyDown: (e: any) => {
          if (stopPropagationIfWidgetSelected(e) && isMac()) {
            dispatch(deleteSelectedWidget(true));
          }
        },
      },
      {
        global: true,
        combo: "del",
        label: "Delete Widget",
        group: "Canvas",
        onKeyDown: (e: any) => {
          if (stopPropagationIfWidgetSelected(e)) {
            dispatch(deleteSelectedWidget(true));
          }
        },
      },
      {
        global: true,
        combo: "mod + x",
        label: "Cut Widget",
        group: "Canvas",
        onKeyDown: (e: any) => {
          if (stopPropagationIfWidgetSelected(e)) {
            dispatch(cutWidget());
          }
        },
      },
    ],
    [],
  );

  return useHotkeys(hotkeys);
};

export default useEditorHotKeys;
