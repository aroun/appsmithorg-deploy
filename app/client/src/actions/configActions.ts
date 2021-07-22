import { ReduxActionTypes } from "constants/ReduxActionConstants";

export const setIsLocalDevMode = (flag: boolean) => ({
  type: ReduxActionTypes.SET_IS_LOCAL_DEV_MODE,
  payload: flag,
});
