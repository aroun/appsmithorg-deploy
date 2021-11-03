import { tw } from "twind";
import React, { memo } from "react";
import * as Sentry from "@sentry/react";

import { MainContainerLayoutControl } from "../MainContainerLayoutControl";

export const CanvasPropertyPane = memo(() => {
  return (
    <div className={tw`relative space-y-3`}>
      <div className={tw`px-3 py-3`}>
        <h3 className={tw`text-sm font-medium uppercase`}>Properties</h3>
      </div>

      <MainContainerLayoutControl />
    </div>
  );
});

CanvasPropertyPane.displayName = "CanvasPropertyPane";

export default Sentry.withProfiler(CanvasPropertyPane);
