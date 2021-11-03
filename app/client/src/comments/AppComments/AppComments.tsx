import React from "react";
import { tw } from "twind";
import { useSelector } from "react-redux";
import { commentModeSelector } from "selectors/commentsSelectors";
import AppCommentsHeader from "./AppCommentsHeader";
import AppCommentThreads from "./AppCommentThreads";

function AppComments() {
  const isCommentMode = useSelector(commentModeSelector);

  if (!isCommentMode) return null;

  return (
    <div
      className={tw`absolute top-0 left-0 flex flex-col w-full h-full bg-white z-7`}
    >
      <AppCommentsHeader />
      <AppCommentThreads />
    </div>
  );
}

export default AppComments;
