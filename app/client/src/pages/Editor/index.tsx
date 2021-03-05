import React, { Component, FC, useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { connect, useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useParams, withRouter } from "react-router-dom";
import { BuilderRouteParams, ApplicationRouteParams } from "constants/routes";
import { AppState } from "reducers";
import MainContainer from "./MainContainer";
import { DndProvider } from "react-dnd";
import TouchBackend from "react-dnd-touch-backend";
import {
  getCurrentApplicationId,
  getCurrentPageId,
  getIsEditorInitialized,
  getIsEditorLoading,
  getIsPublishingApplication,
  getPublishingError,
} from "selectors/editorSelectors";
import { Hotkey, Hotkeys, Spinner, useHotkeys } from "@blueprintjs/core";
import { HotkeysTarget } from "@blueprintjs/core/lib/esnext/components/hotkeys/hotkeysTarget.js";
import { initEditor } from "actions/initActions";
import { editorInitializer } from "utils/EditorUtils";
import {
  ENTITY_EXPLORER_SEARCH_ID,
  WIDGETS_SEARCH_ID,
} from "constants/Explorer";
import CenteredWrapper from "components/designSystems/appsmith/CenteredWrapper";
import { getCurrentUser } from "selectors/usersSelectors";
import { User } from "constants/userConstants";
import ConfirmRunModal from "pages/Editor/ConfirmRunModal";
import * as Sentry from "@sentry/react";
import {
  copyWidget,
  cutWidget,
  deleteSelectedWidget,
  pasteWidget,
} from "actions/widgetActions";
import { isMac } from "utils/helpers";
import { getSelectedWidget } from "selectors/ui";
import { MAIN_CONTAINER_WIDGET_ID } from "constants/WidgetConstants";
import Welcome from "./Welcome";
import { getThemeDetails, ThemeMode } from "selectors/themeSelectors";
import { ThemeProvider } from "styled-components";
import { Theme } from "constants/DefaultTheme";
import useEditorHotKeys from "./useEditorHotKeys";

// type EditorProps = {
//   currentApplicationId?: string;
//   currentPageId?: string;
//   initEditor: (applicationId: string, pageId: string) => void;
//   isPublishing: boolean;
//   isEditorLoading: boolean;
//   isEditorInitialized: boolean;
//   isEditorInitializeError: boolean;
//   errorPublishing: boolean;
//   creatingOnboardingDatabase: boolean;
//   copySelectedWidget: () => void;
//   pasteCopiedWidget: () => void;
//   deleteSelectedWidget: () => void;
//   cutSelectedWidget: () => void;
//   user?: User;
//   selectedWidget?: string;
//   lightTheme: Theme;
// };

const Editor: FC = () => {
  const dispatch = useDispatch();
  const { handleKeyDown, handleKeyUp } = useEditorHotKeys();

  const [registered, setRegistered] = useState<boolean>(false);
  const { applicationId } = useParams<ApplicationRouteParams>();
  const isEditorInitialized = useSelector(getIsEditorInitialized);
  const lightTheme = useSelector<AppState>((state) =>
    getThemeDetails(state, ThemeMode.LIGHT),
  );
  const creatingOnboardingDatabase = useSelector<AppState, boolean>(
    (state) => state.ui.onBoarding.showOnboardingLoader,
  );

  useEffect(() => {
    editorInitializer().then(() => {
      setRegistered(true);
    });
  }, []);

  useEffect(() => {
    dispatch(initEditor(applicationId));
  }, [applicationId]);

  if (creatingOnboardingDatabase) {
    return <Welcome />;
  }

  if (!isEditorInitialized || !registered) {
    return (
      <CenteredWrapper style={{ height: "calc(100vh - 35px)" }}>
        <Spinner />
      </CenteredWrapper>
    );
  }

  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <ThemeProvider theme={lightTheme}>
        <DndProvider
          backend={TouchBackend}
          options={{
            enableMouseEvents: true,
          }}
        >
          <div>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Editor | Appsmith</title>
            </Helmet>
            <MainContainer />
          </div>
          <ConfirmRunModal />
        </DndProvider>
      </ThemeProvider>
    </div>
  );
};

// shouldComponentUpdate(nextProps: Props, nextState: { registered: boolean }) {
//
// }

// const mapStateToProps = (state: AppState) => ({
//   currentApplicationId: getCurrentApplicationId(state),
//   currentPageId: getCurrentPageId(state),
//   errorPublishing: getPublishingError(state),
//   isPublishing: getIsPublishingApplication(state),
//   isEditorLoading: getIsEditorLoading(state),
//   isEditorInitialized: getIsEditorInitialized(state),
//   user: getCurrentUser(state),
//   selectedWidget: getSelectedWidget(state),
//   lightTheme: getThemeDetails(state, ThemeMode.LIGHT),
// });

// const MemoizedEditor = useMemo(Editor, (prevProps, nextProps) => {
//   return (
//     nextProps.currentPageId !== nextProps.currentPageId ||
//     nextProps.currentApplicationId !== nextProps.currentApplicationId ||
//     nextProps.isEditorInitialized !== nextProps.isEditorInitialized ||
//     nextProps.isPublishing !== nextProps.isPublishing ||
//     nextProps.isEditorLoading !== nextProps.isEditorLoading ||
//     nextProps.errorPublishing !== nextProps.errorPublishing ||
//     nextProps.isEditorInitializeError !== nextProps.isEditorInitializeError ||
//     nextProps.creatingOnboardingDatabase !==
//       nextProps.creatingOnboardingDatabase ||
//     nextState.registered !== this.state.registered
//   );
// });

export default Sentry.withProfiler(Editor);
