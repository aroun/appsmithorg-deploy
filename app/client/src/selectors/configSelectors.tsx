import { AppState } from "reducers";

export const getIsLocalDevMode = (state: AppState) =>
  state.ui.config.isLocalDevMode;
