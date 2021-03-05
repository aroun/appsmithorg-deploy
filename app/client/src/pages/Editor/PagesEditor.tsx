import * as log from "loglevel";
import styled from "styled-components";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { AppState } from "reducers";
import AnalyticsUtil from "utils/AnalyticsUtil";
import PerformanceTracker from "utils/PerformanceTracker";
import Icon, { IconSize } from "components/ads/Icon";
import { getCurrentApplication } from "selectors/applicationSelectors";
import { Colors } from "constants/Colors";
import Button, { Size } from "components/ads/Button";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  overflow: hidden;
  background: ${(props) => {
    return props.theme.colors.artboard;
  }};
  padding: 20px;
  height: calc(100vh - ${(props) => props.theme.smallHeaderHeight});
`;

const PageList = styled.div``;
const PageListItem = styled.div`
  padding: 10px;
  margin-top: 10px;
  background: ${(props) => {
    return props.theme.colors.appBackground;
  }};
  display: flex;
  align-items-center
`;
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
    <PageWrapper>
      <div>
        <Button
          text="New Page"
          tag="button"
          size={Size.medium}
          type="button"
          onClick={() => {
            console.log("hi");
          }}
          className="t--apiFormRunBtn"
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`droppable-pages-list-${currentApp?.id}`}>
          {(provided) => (
            <PageList ref={provided.innerRef} {...provided.droppableProps}>
              {pages.map((page, index) => (
                <Draggable
                  draggableId={page.pageId}
                  key={page.pageId}
                  index={index}
                >
                  {(provided) => (
                    <PageListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <DragHandler {...provided.dragHandleProps}>
                        <Icon
                          fillColor={Colors.BLACK}
                          name={"drag-handle"}
                          size={IconSize.SMALL}
                        />
                      </DragHandler>
                      {page.pageName}
                    </PageListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </PageList>
          )}
        </Droppable>
      </DragDropContext>
    </PageWrapper>
  );
};

export default PagesEditor;
