import * as log from "loglevel";
import styled from "styled-components";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Tooltip, Position } from "@blueprintjs/core";

import { AppState } from "reducers";
import AnalyticsUtil from "utils/AnalyticsUtil";
import PerformanceTracker from "utils/PerformanceTracker";
import Icon, { IconSize } from "components/ads/Icon";
import { getCurrentApplication } from "selectors/applicationSelectors";
import { Colors } from "constants/Colors";
import Button, { Size } from "components/ads/Button";
import { FormIcons } from "icons/FormIcons";
import { ControlIcons } from "icons/ControlIcons";
import { theme } from "constants/DefaultTheme";

const CopyIcon = ControlIcons.COPY_CONTROL;
const DeleteIcon = FormIcons.DELETE_ICON;

const DragHandler = styled.div`
  cursor: move !important;
  display: flex;
  align-items: center;
`;

/* eslint-disable react/display-name */
const PagesEditor = () => {
  const currentApp = useSelector(getCurrentApplication);
  const pages = useSelector((state: AppState) => {
    return state.entities.pageList.pages;
  });

  // log page load
  useEffect(() => {
    AnalyticsUtil.logEvent("PAGE_LIST_LOAD", {
      appName: currentApp?.name,
      mode: "EDIT",
    });
  }, []);

  log.debug("Canvas rendered");
  PerformanceTracker.stopTracking();

  const onDragEnd = (result: any) => {
    //
  };

  return (
    <div className="py-6 px-8 bg-appsmith-artboard h-full">
      <div className="flex">
        <Button
          text="New Page"
          tag="button"
          size={Size.medium}
          type="button"
          onClick={() => {
            console.log("hi");
          }}
          className="t--apiFormRunBtn ml-auto"
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`droppable-pages-list-${currentApp?.id}`}>
          {(provided) => (
            <div
              className="pt-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {pages.map((page, index) => (
                <Draggable
                  draggableId={page.pageId}
                  key={page.pageId}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center p-4 mt-2 bg-appsmith-app"
                    >
                      <DragHandler {...provided.dragHandleProps}>
                        {/* drag handler */}
                        <Icon
                          className="opacity-30"
                          fillColor={Colors.BLACK}
                          name={"drag-handle"}
                          size={IconSize.SMALL}
                        />
                      </DragHandler>
                      <div className="flex-1 pl-2">
                        <p className="text-gray-800">{page.pageName}</p>
                      </div>
                      <Tooltip
                        content="Copy Widget"
                        position={Position.TOP}
                        hoverOpenDelay={200}
                      >
                        <CopyIcon
                          className="t--copy-widget"
                          width={14}
                          height={14}
                          color={theme.colors.paneSectionLabel}
                        />
                      </Tooltip>
                      <div className="ml-3">
                        <DeleteIcon
                          className=""
                          width={16}
                          height={16}
                          color={theme.colors.paneSectionLabel}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default PagesEditor;
