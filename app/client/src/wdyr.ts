/// <reference types="@welldone-software/why-did-you-render" />
// ^ https://github.com/welldone-software/why-did-you-render/issues/161
import React from "react";
import { useDragReflow } from "resizable/resizenreflow/useDragReflow";
import { useBlocksToBeDraggedOnCanvas } from "utils/hooks/useBlocksToBeDraggedOnCanvas";
import { useCanvasDragging } from "utils/hooks/useCanvasDragging";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: false,
    trackExtraHooks: [
      [
        require("react-redux/lib"),
        "useSelector",
        useCanvasDragging,
        useBlocksToBeDraggedOnCanvas,
        useDragReflow,
      ],
    ],
  });
}
export default "";
