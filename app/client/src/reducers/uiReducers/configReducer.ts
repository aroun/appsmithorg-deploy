import { ReduxAction, ReduxActionTypes } from "constants/ReduxActionConstants";
import { AppState } from "reducers";
import { createReducer } from "utils/AppsmithUtils";

const initialState: ConfigReduxState = {
  isLocalDevMode: true,
};

const configReducer = createReducer(initialState, {
  [ReduxActionTypes.SET_IS_LOCAL_DEV_MODE]: (
    state: AppState,
    action: ReduxAction<boolean>,
  ) => ({
    ...state,
    isLocalDevMode: action.payload,
  }),
});

export type ConfigReduxState = {
  isLocalDevMode: boolean;
};

export default configReducer;
