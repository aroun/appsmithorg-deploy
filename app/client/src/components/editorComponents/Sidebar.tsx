import { tw } from "twind";
import history from "utils/history";
import * as Sentry from "@sentry/react";
import { useDispatch, useSelector } from "react-redux";
import { PanelStack } from "@blueprintjs/core";
import React, { memo, useEffect, useRef, useCallback, useState } from "react";

import PerformanceTracker, {
  PerformanceTransactionName,
} from "utils/PerformanceTracker";
import {
  getCurrentApplicationId,
  getCurrentPageId,
} from "selectors/editorSelectors";
import { AppState } from "reducers";
import {
  getFirstTimeUserOnboardingComplete,
  getIsFirstTimeUserOnboardingEnabled,
} from "selectors/onboardingSelectors";
import Explorer from "pages/Editor/Explorer";
import Switcher from "components/ads/Switcher";
import { trimQueryString } from "utils/helpers";
import { BUILDER_PAGE_URL } from "constants/routes";
import AppComments from "comments/AppComments/AppComments";
import {
  setExplorerActiveAction,
  setExplorerPinnedAction,
} from "actions/explorerActions";
import {
  getExplorerActive,
  getExplorerPinned,
} from "selectors/explorerSelector";
import { previewModeSelector } from "selectors/editorSelectors";
import useHorizontalResize from "utils/hooks/useHorizontalResize";
import { forceOpenWidgetPanel } from "actions/widgetSidebarActions";
import { ReactComponent as PinIcon } from "assets/icons/ads/double-arrow-left.svg";
import { toggleInOnboardingWidgetSelection } from "actions/onboardingActions";
import OnboardingStatusbar from "pages/Editor/FirstTimeUserOnboarding/Statusbar";
import TooltipComponent from "components/ads/Tooltip";

type Props = {
  width: number;
  onWidthChange?: (width: number) => void;
  onDragEnd?: () => void;
};

export const EntityExplorerSidebar = memo((props: Props) => {
  const dispatch = useDispatch();
  const active = useSelector(getExplorerActive);
  const pageId = useSelector(getCurrentPageId);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pinned = useSelector(getExplorerPinned);
  const isPreviewMode = useSelector(previewModeSelector);
  const applicationId = useSelector(getCurrentApplicationId);
  const enableFirstTimeUserOnboarding = useSelector(
    getIsFirstTimeUserOnboardingEnabled,
  );
  const isFirstTimeUserOnboardingEnabled = useSelector(
    getIsFirstTimeUserOnboardingEnabled,
  );
  const resizer = useHorizontalResize(
    sidebarRef,
    props.onWidthChange,
    props.onDragEnd,
  );
  const switches = [
    {
      id: "explorer",
      text: "Explorer",
      action: () => dispatch(forceOpenWidgetPanel(false)),
    },
    {
      id: "widgets",
      text: "Widgets",
      action: () => {
        !(
          trimQueryString(
            BUILDER_PAGE_URL({
              applicationId,
              pageId,
            }),
          ) === window.location.pathname
        ) &&
          history.push(
            BUILDER_PAGE_URL({
              applicationId,
              pageId,
            }),
          );
        setTimeout(() => dispatch(forceOpenWidgetPanel(true)), 0);
        if (isFirstTimeUserOnboardingEnabled) {
          dispatch(toggleInOnboardingWidgetSelection(true));
        }
      },
    },
  ];
  const [activeSwitch, setActiveSwitch] = useState(switches[0]);
  const isForceOpenWidgetPanel = useSelector(
    (state: AppState) => state.ui.onBoarding.forceOpenWidgetPanel,
  );
  const isFirstTimeUserOnboardingComplete = useSelector(
    getFirstTimeUserOnboardingComplete,
  );
  PerformanceTracker.startTracking(PerformanceTransactionName.SIDE_BAR_MOUNT);
  useEffect(() => {
    PerformanceTracker.stopTracking();
  });

  useEffect(() => {
    if (isForceOpenWidgetPanel) {
      setActiveSwitch(switches[1]);
    } else {
      setActiveSwitch(switches[0]);
    }
  }, [isForceOpenWidgetPanel]);

  // registering event listeners
  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [active, pinned, resizer.resizing]);

  /**
   * passing the event to touch move on mouse move
   *
   * @param event
   */
  const onMouseMove = (event: MouseEvent) => {
    const eventWithTouches = Object.assign({}, event, {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
    });
    onTouchMove(eventWithTouches);
  };

  /**
   * calculate the new width based on the pixel moved
   *
   * @param event
   */
  const onTouchMove = (
    event:
      | TouchEvent
      | (MouseEvent & { touches: { clientX: number; clientY: number }[] }),
  ) => {
    const currentX = event.touches[0].clientX;

    if (!pinned) {
      if (!active) {
        if (currentX <= 5) {
          dispatch(setExplorerActiveAction(true));
        }
      }

      if (currentX >= props.width + 20 && !resizer.resizing) {
        dispatch(setExplorerActiveAction(false));
      }
    }
  };
  /**
   * toggles the pinned state of sidebar
   */
  const onPin = useCallback(() => {
    dispatch(setExplorerPinnedAction(!pinned));
  }, [pinned, dispatch, setExplorerPinnedAction]);

  return (
    <div
      className={tw`js-entity-explorer t--entity-explorer transform transition-all flex h-full z-3 duration-400 border-r border-gray-200
        ${pinned && !isPreviewMode && "relative"}
        ${((!pinned && !active) || isPreviewMode) && "-translate-x-full"}
        ${!pinned && "shadow-xl"}
        ${(!pinned || isPreviewMode) && "fixed"} `}
    >
      {/* SIDEBAR */}
      <div
        className={tw`flex flex-col p-0 overflow-y-auto bg-white t--sidebar min-w-48 max-w-96
          ${resizer.resizing && "pointer-events-none"}`}
        ref={sidebarRef}
        style={{ width: props.width }}
      >
        {(enableFirstTimeUserOnboarding ||
          isFirstTimeUserOnboardingComplete) && <OnboardingStatusbar />}

        {/* ENTITY EXPLORE HEADER */}
        <div
          className={tw`sticky top-0 flex items-center justify-between px-3 py-3 z-1`}
        >
          <h3 className={tw`text-sm font-medium text-gray-800 uppercase`}>
            Navigation
          </h3>
          <div
            className={tw`flex items-center transition-all duration-300 transform
            ${pinned === false && "opacity-0 pointer-events-none scale-50"}
            ${pinned === true && "opacity-100 scale-100"}`}
          >
            <TooltipComponent
              content={
                <div className={tw`flex items-center justify-between`}>
                  <span>Close sidebar</span>
                  <span className={tw`ml-4 text-xs text-gray-300`}>
                    Ctrl + /
                  </span>
                </div>
              }
            >
              <button
                className={tw`p-2 hover:bg-warmGray-100 group t--unpin-entity-explorer`}
                onClick={onPin}
                type="button"
              >
                <PinIcon className={tw`w-3 h-3 text-trueGray-500`} />
              </button>
            </TooltipComponent>
          </div>
        </div>

        {/* SWITCHER */}
        <div className={tw`px-3 mt-1 mb-3`}>
          <Switcher activeObj={activeSwitch} switches={switches} />
        </div>

        <PanelStack
          className={tw`flex-grow`}
          initialPanel={{
            component: Explorer,
          }}
          showPanelHeader={false}
        />
        <AppComments />
      </div>

      {/* RESIZER */}
      <div
        className={tw`absolute z-10 w-1 h-full -mr-1 group cursor-ew-resize`}
        onMouseDown={resizer.onMouseDown}
        onTouchEnd={resizer.onMouseUp}
        onTouchStart={resizer.onTouchStart}
        style={{
          left: !pinned && !active ? 0 : props.width,
          display: isPreviewMode ? "none" : "initial",
        }}
      >
        <div
          className={tw`w-1 h-full  transform transition
          ${resizer.resizing && "bg-gray-400"}
          ${!resizer.resizing && "bg-transparent group-hover:bg-gray-200"}`}
        />
      </div>
    </div>
  );
});

EntityExplorerSidebar.displayName = "EntityExplorerSidebar";

export default Sentry.withProfiler(EntityExplorerSidebar);
