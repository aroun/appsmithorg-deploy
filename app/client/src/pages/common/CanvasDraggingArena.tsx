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
import { omit, throttle } from "lodash";
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
import { getSnappedXY } from "components/editorComponents/Dropzone";

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

export function CanvasDraggingArena({
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
}) {
  const dragParent = useSelector(
    (state: AppState) => state.ui.widgetDragResize.dragParent,
  );
  const selectedWidgets = useSelector(getSelectedWidgets);
  const occupiedSpaces = useSelector(getOccupiedSpaces) || {};
  const childrenOccupiedSpaces: OccupiedSpace[] =
    occupiedSpaces[dragParent] || [];
  const isDragging = useSelector(
    (state: AppState) => state.ui.widgetDragResize.isDragging,
  );
  const dragCenter = useSelector(
    (state: AppState) => state.ui.widgetDragResize.dragCenter,
  );
  const dragCenterSpace = childrenOccupiedSpaces.find(
    (each) => each.id === dragCenter,
  );
  const rectanglesToDraw = childrenOccupiedSpaces
    .filter((each) => selectedWidgets.includes(each.id))
    .map((each) => ({
      top: each.top * snapRowSpace + (noPad ? 0 : CONTAINER_GRID_PADDING),
      left: each.left * snapColumnSpace + (noPad ? 0 : CONTAINER_GRID_PADDING),
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
      // draggingCanvas.style.padding = `${noPad ? 0 : CONTAINER_GRID_PADDING}px`;
      const bounds = draggingCanvas.getBoundingClientRect();
      const { height, width } = draggingCanvas.getBoundingClientRect();
      draggingCanvas.width = width;
      draggingCanvas.height = height;
      const canvasCtx = draggingCanvas.getContext("2d");
      canvasCtx.globalCompositeOperation = "destination-over";
      const startPoints = {
        left: 0,
        top: 0,
      };
      const differentParent = dragParent !== widgetId;
      const parentDiff = {
        top:
          differentParent && dragCenterSpace
            ? dragCenterSpace.top * snapRowSpace +
              (noPad ? 0 : CONTAINER_GRID_PADDING)
            : 0,
        left:
          differentParent && dragCenterSpace
            ? dragCenterSpace.left * snapColumnSpace +
              (noPad ? 0 : CONTAINER_GRID_PADDING)
            : 0,
      };
      let canvasIsDragging = false;
      const onMouseUp = (e: any) => {
        startPoints.left = 0;
        startPoints.top = 0;
        setIsDragging(false);
        onMouseOut();
      };
      const onMouseOut = () => {
        draggingCanvas.style.zIndex = null;
        canvasCtx.clearRect(0, 0, width, height);
        canvasIsDragging = false;
      };
      const onMouseDown = (e: any) => {
        if (isDragging && !canvasIsDragging) {
          canvasIsDragging = true;
          if (dragParent === widgetId) {
            startPoints.left = e.offsetX;
            startPoints.top = e.offsetY;
          }
          draggingCanvas.style.zIndex = 2;
        }
      };
      const onMouseMove = (e: any) => {
        if (canvasIsDragging) {
          console.log(startPoints, e.offsetX, draggingCanvas.offsetLeft);
          canvasCtx.clearRect(0, 0, width, height);
          const diff = {
            left: e.offsetX - startPoints.left - parentDiff.left,
            top: e.offsetY - startPoints.top - parentDiff.top,
          };
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
      draggingCanvas.addEventListener("mouseover", onMouseDown, false);
      draggingCanvas.addEventListener("mouseout", onMouseOut, false);

      const drawRectangle = (selectionDimensions: {
        top: number;
        left: number;
        width: number;
        height: number;
        columnWidth: number;
        rowHeight: number;
        widgetId: string;
      }) => {
        const currentOccSpaces = occupiedSpaces[widgetId];
        const occSpaces: OccupiedSpace[] =
          dragParent === widgetId
            ? childrenOccupiedSpaces.filter(
                (each) => !selectedWidgets.includes(each.id),
              )
            : currentOccSpaces;
        const isNotColliding = noCollision(
          { x: selectionDimensions.left, y: selectionDimensions.top },
          snapColumnSpace,
          snapRowSpace,
          { x: 0, y: 0 },
          selectionDimensions.columnWidth,
          selectionDimensions.rowHeight,
          selectionDimensions.widgetId,
          occSpaces,
          snapRows,
          GridDefaults.DEFAULT_GRID_COLUMNS,
        );
        const snappedXY = getSnappedXY(
          snapColumnSpace,
          snapRowSpace,
          {
            x: selectionDimensions.left,
            y: selectionDimensions.top,
          },
          {
            x: 0,
            y: 0,
          },
        );

        canvasCtx.fillStyle = `${
          isNotColliding ? "rgb(104,	113,	239, 0.6)" : "red"
        }`;
        canvasCtx.fillRect(
          selectionDimensions.left,
          selectionDimensions.top,
          selectionDimensions.width,
          selectionDimensions.height,
        );
        canvasCtx.fillStyle = `${
          isNotColliding ? "rgb(233, 250, 243, 0.6)" : "red"
        }`;
        const strokeWidth = 1;
        canvasCtx.setLineDash([3]);
        canvasCtx.strokeStyle = "rgb(104,	113,	239)";
        canvasCtx.strokeRect(
          snappedXY.X + strokeWidth + (noPad ? 0 : CONTAINER_GRID_PADDING),
          snappedXY.Y + strokeWidth + (noPad ? 0 : CONTAINER_GRID_PADDING),
          selectionDimensions.width - strokeWidth,
          selectionDimensions.height - strokeWidth,
        );
      };

      if (canvasIsDragging) {
        rectanglesToDraw.forEach((each) => {
          drawRectangle(each);
        });
      }
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
}
CanvasDraggingArena.displayName = "CanvasDraggingArena";
