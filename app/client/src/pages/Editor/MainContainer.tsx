import React from "react";
import * as Sentry from "@sentry/react";
import { Route, Switch } from "react-router";

import EditorsRouter from "./routes";
import styled from "styled-components";
import PagesEditor from "./PagesEditor";
import WidgetsEditor from "./WidgetsEditor";
import Sidebar from "components/editorComponents/Sidebar";
import { APPLICATION_PAGE_LIST_URL, BUILDER_URL } from "constants/routes";

const SentryRoute = Sentry.withSentryRouting(Route);

const Container = styled.div`
  display: flex;
  height: calc(100vh - ${(props) => props.theme.smallHeaderHeight});
  background-color: ${(props) => props.theme.appBackground};
`;

const EditorContainer = styled.div`
  position: relative;
  width: calc(100vw - ${(props) => props.theme.sidebarWidth});
`;

const MainContainer = () => {
  return (
    <Container>
      <Sidebar />
      <EditorContainer>
        <Switch>
          <SentryRoute exact path={BUILDER_URL} component={WidgetsEditor} />
          <SentryRoute
            exact
            path={APPLICATION_PAGE_LIST_URL}
            component={PagesEditor}
          />
          <SentryRoute component={EditorsRouter} />
        </Switch>
      </EditorContainer>
    </Container>
  );
};

MainContainer.displayName = "MainContainer";

export default MainContainer;
