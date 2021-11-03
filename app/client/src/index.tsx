import React from "react";
import "./wdyr";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import { ThemeProvider } from "constants/DefaultTheme";
import { appInitializer } from "utils/AppsmithUtils";
import { Slide } from "react-toastify";
import store from "./store";
import { setup } from "twind";
import { LayersContext, Layers } from "constants/Layers";
import AppRouter from "./AppRouter";
import * as Sentry from "@sentry/react";
import { getCurrentThemeDetails, ThemeMode } from "selectors/themeSelectors";
import { connect } from "react-redux";
import { AppState } from "reducers";
import { setThemeMode } from "actions/themeActions";
import { StyledToastContainer } from "components/ads/Toast";
import localStorage from "utils/localStorage";
import "./assets/styles/index.css";
import "./polyfills/corejs-add-on";
// enable autofreeze only in development
import { setAutoFreeze } from "immer";
const shouldAutoFreeze = process.env.NODE_ENV === "development";
setAutoFreeze(shouldAutoFreeze);

import AppErrorBoundary from "./AppErrorBoundry";
import GlobalStyles from "globalStyles";
appInitializer();

setup({
  theme: {
    extend: {
      zIndex: {
        auto: "auto",
        0: "0",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
      },
      spacing: {
        100: "28rem",
        104: "32rem",
        108: "26rem",
      },
      maxWidth: (theme, { breakpoints }) => ({
        0: "0px",
        auto: "auto",
        ...theme("spacing"),
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
        full: "100%",
        screen: "100vw",
        min: "min-content",
        max: "max-content",
      }),
      minWidth: (theme) => ({
        0: "0px",
        auto: "auto",
        ...theme("spacing"),
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
        full: "100%",
        screen: "100vw",
        min: "min-content",
        max: "max-content",
      }),
    },
  },
});

function App() {
  return (
    <Sentry.ErrorBoundary fallback={"An error has occured"}>
      <Provider store={store}>
        <LayersContext.Provider value={Layers}>
          <ThemedAppWithProps />
        </LayersContext.Provider>
      </Provider>
    </Sentry.ErrorBoundary>
  );
}

class ThemedApp extends React.Component<{
  currentTheme: any;
  setTheme: (themeMode: ThemeMode) => void;
}> {
  componentDidMount() {
    if (localStorage.getItem("THEME") === "LIGHT") {
      this.props.setTheme(ThemeMode.LIGHT);
    }
  }
  render() {
    return (
      <ThemeProvider theme={this.props.currentTheme}>
        <StyledToastContainer
          autoClose={5000}
          closeButton={false}
          draggable={false}
          hideProgressBar
          pauseOnHover={false}
          transition={Slide}
        />
        <GlobalStyles />
        <AppErrorBoundary>
          <AppRouter />
        </AppErrorBoundary>
      </ThemeProvider>
    );
  }
}
const mapStateToProps = (state: AppState) => ({
  currentTheme: getCurrentThemeDetails(state),
});
const mapDispatchToProps = (dispatch: any) => ({
  setTheme: (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  },
});

const ThemedAppWithProps = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ThemedApp);

ReactDOM.render(<App />, document.getElementById("root"));

// expose store when run in Cypress
if ((window as any).Cypress) {
  (window as any).store = store;
}
