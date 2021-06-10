import {
  selectAllWidgetsInAreaAction,
  setCanvasSelectionStateAction,
} from "actions/canvasSelectionActions";
import { OccupiedSpace } from "constants/editorConstants";
import {
  CONTAINER_GRID_PADDING,
  GridDefaults,
  MAIN_CONTAINER_WIDGET_ID,
} from "constants/WidgetConstants";
import { throttle } from "lodash";
import React, { memo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "reducers";
import { getWidget, getWidgets } from "sagas/selectors";
import {
  getCurrentApplicationLayout,
  getCurrentPageId,
  getOccupiedSpaces,
} from "selectors/editorSelectors";
import { getSelectedWidgets } from "selectors/ui";
import styled from "styled-components";
import { useWidgetDragResize } from "utils/hooks/dragResizeHooks";
import { XYCoord } from "react-dnd";
import {
  getDropZoneOffsets,
  isDropZoneOccupied,
  isWidgetOverflowingParentBounds,
} from "utils/WidgetPropsUtils";

const StyledSelectionCanvas = styled.canvas`
  position: absolute;
  top: 0px;
  left: 0px;
  height: calc(100% + ${(props) => props.theme.canvasBottomPadding}px);
  width: 100%;
  overflow-y: auto;
`;

export interface SelectedArenaDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

const noCollision = (
  clientOffset: XYCoord,
  colWidth: number,
  rowHeight: number,
  dropTargetOffset: XYCoord,
  widgetWidth: number,
  widgetHeight: number,
  widgetId: string,
  occupiedSpaces?: OccupiedSpace[],
  rows?: number,
  cols?: number,
): boolean => {
  if (clientOffset && dropTargetOffset) {
    // if (widget.detachFromLayout) {
    //   return true;
    // }
    const [left, top] = getDropZoneOffsets(
      colWidth,
      rowHeight,
      clientOffset as XYCoord,
      dropTargetOffset,
    );
    if (left < 0 || top < 0) {
      return false;
    }
    const currentOffset = {
      left,
      right: left + widgetWidth,
      top,
      bottom: top + widgetHeight,
    };
    return (
      !isDropZoneOccupied(currentOffset, widgetId, occupiedSpaces) &&
      !isWidgetOverflowingParentBounds({ rows, cols }, currentOffset)
    );
  }
  return false;
};

export const CanvasDraggingArena = memo(
  ({
    childWidgets,
    noPad,
    snapColumnSpace,
    snapRows,
    snapRowSpace,
    widgetId,
  }: {
    childWidgets: string[];
    noPad?: boolean;
    snapColumnSpace: number;
    snapRows: number;
    snapRowSpace: number;
    widgetId: string;
  }) => {
    const selectedWidgets = useSelector(getSelectedWidgets);
    const selectedWidgetsToDrag = childWidgets.filter((each) =>
      selectedWidgets.includes(each),
    );
    const occupiedSpaces = useSelector(getOccupiedSpaces) || {};
    const childrenOccupiedSpaces: OccupiedSpace[] =
      occupiedSpaces[widgetId] || [];
    const isDragging = useSelector(
      (state: AppState) => state.ui.widgetDragResize.isDragging,
    );
    const rectanglesToDraw = childrenOccupiedSpaces
      .filter((each) => selectedWidgetsToDrag.includes(each.id))
      .map((each) => ({
        top: each.top * snapRowSpace + (noPad ? 0 : CONTAINER_GRID_PADDING),
        left:
          each.left * snapColumnSpace + (noPad ? 0 : CONTAINER_GRID_PADDING),
        width: (each.right - each.left) * snapColumnSpace,
        height: (each.bottom - each.top) * snapRowSpace,
        columnWidth: each.right - each.left,
        rowHeight: each.bottom - each.top,
        widgetId: each.id,
      }));
    const { setIsDragging } = useWidgetDragResize();

    useEffect(() => {
      const startDragging = () => {
        const draggingCanvas: any = document.getElementById(
          `canvas-dragging-${widgetId}`,
        );
        const bounds = draggingCanvas.getBoundingClientRect();
        const { height, width } = draggingCanvas.getBoundingClientRect();
        draggingCanvas.width = width;
        draggingCanvas.height = height;
        const canvasCtx = draggingCanvas.getContext("2d");
        const startPoints = {
          left: 0,
          top: 0,
        };
        let isDragging = false;
        const onMouseUp = (e: any) => {
          startPoints.left = 0;
          startPoints.top = 0;
          draggingCanvas.style.zIndex = null;
          canvasCtx.clearRect(0, 0, width, height);
          setIsDragging(false);
          isDragging = false;
        };
        const onMouseDown = (e: any) => {
          if (!isDragging) {
            isDragging = true;
            startPoints.left = e.offsetX;
            startPoints.top = e.offsetY;
            draggingCanvas.style.zIndex = 2;
          }
        };
        const onMouseMove = (e: any) => {
          if (isDragging) {
            canvasCtx.clearRect(0, 0, width, height);
            const diff = {
              left: e.offsetX - draggingCanvas.offsetLeft - startPoints.left,
              top: e.offsetY - draggingCanvas.offsetTop - startPoints.top,
            };
            console.log(diff);
            const newRectanglesToDraw = rectanglesToDraw.map((each) => ({
              ...each,
              left: each.left + diff.left,
              top: each.top + diff.top,
            }));
            newRectanglesToDraw.forEach((each) => {
              drawRectangle(each);
            });
          } else {
            onMouseDown(e);
          }
        };
        draggingCanvas.addEventListener("mousemove", onMouseMove, false);
        draggingCanvas.addEventListener("mouseup", onMouseUp, false);

        const drawRectangle = (selectionDimensions: {
          top: number;
          left: number;
          width: number;
          height: number;
          columnWidth: number;
          rowHeight: number;
          widgetId: string;
        }) => {
          const isNotColliding = noCollision(
            { x: selectionDimensions.left, y: selectionDimensions.top },
            snapColumnSpace,
            snapRowSpace,
            { x: bounds.x, y: bounds.y },
            selectionDimensions.columnWidth,
            selectionDimensions.rowHeight,
            selectionDimensions.widgetId,
            occupiedSpaces[widgetId],
            snapRows,
            GridDefaults.DEFAULT_GRID_COLUMNS,
          );
          const strokeWidth = 1;
          canvasCtx.setLineDash([5]);
          canvasCtx.strokeStyle = "rgb(84, 132, 236)";
          canvasCtx.strokeRect(
            selectionDimensions.left - strokeWidth,
            selectionDimensions.top - strokeWidth,
            selectionDimensions.width + 2 * strokeWidth,
            selectionDimensions.height + 2 * strokeWidth,
          );
          canvasCtx.fillStyle = `${
            isNotColliding ? "rgb(84, 132, 236, 0.06)" : "red"
          }`;
          canvasCtx.fillRect(
            selectionDimensions.left,
            selectionDimensions.top,
            selectionDimensions.width,
            selectionDimensions.height,
          );
        };
        rectanglesToDraw.forEach((each) => {
          drawRectangle(each);
        });
      };
      if (isDragging) {
        startDragging();
      }
    }, [isDragging]);
    return (
      <StyledSelectionCanvas
        data-testid={`canvas-dragging-${widgetId}`}
        id={`canvas-dragging-${widgetId}`}
      />
    );
  },
);
CanvasDraggingArena.displayName = "CanvasDraggingArena";
