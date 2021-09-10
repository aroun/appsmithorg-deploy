import { FetchApplicationPayload } from "actions/applicationActions";
import {
  installationFailed,
  installationSuccessful,
} from "actions/cutomLibsActions";
import { ApiResponse } from "api/ApiResponses";
import ApplicationApi from "api/ApplicationApi";
import CustomLibsApi from "api/CustomLibsApi";
import { Variant } from "components/ads/common";
import { Toaster } from "components/ads/Toast";
import {
  ReduxAction,
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "constants/ReduxActionConstants";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import { getCurrentApplicationId } from "selectors/editorSelectors";
import TernServer from "utils/autocomplete/TernServer";
import { validateResponse } from "./ErrorSagas";
import { updateLibrariesSaga } from "./EvaluationsSaga";

export function* fetchAppLibrariesSaga(action: ReduxAction<any>) {
  const applicationId = action.payload.applicationId;
  try {
    const response: ApiResponse = yield call(
      CustomLibsApi.fetchAppLibraries,
      applicationId,
    );
    const isValid: boolean = yield call(validateResponse, response);
    if (isValid) {
      const libs = response.data;
      for (let i = libs.length; i--; ) {
        const installationOnWorker: {
          isLoaded: boolean;
          error?: string;
        } = yield call(updateLibrariesSaga, libs[i].url);
        if (installationOnWorker.isLoaded) {
          yield put(installationSuccessful(libs[i]));
          if (libs[i].jsonTypeDefinition) {
            try {
              TernServer.updateDef(libs[i].name, libs[i].jsonTypeDefinition);
            } catch (e) {
              Toaster.show({
                text: `Autocomplete might not work properly for ${libs[i].name}`,
                variant: Variant.info,
              });
            }
          }
        }
      }
    }
    return true;
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_LIBRARY_ERROR,
      payload: {
        error,
      },
    });
  }
}

function* installLibrarySaga(action: ReduxAction<any>) {
  const lib = action.payload;
  const applicationId: string = yield select(getCurrentApplicationId);
  //Save library and trigger definition generator;
  try {
    const installationOnWorker: {
      isLoaded: boolean;
      error?: string;
    } = yield call(updateLibrariesSaga, lib.latest);
    if (installationOnWorker.isLoaded) {
      const response: ApiResponse = yield call(
        CustomLibsApi.installLibrary,
        applicationId,
        lib,
      );
      const isValid: boolean = yield call(validateResponse, response);
      if (isValid) {
        try {
          TernServer.updateDef(lib.name, response.data.jsonTypeDefinition);
        } catch (error) {
          Toaster.show({
            text: "Autocomplete might not work properly",
            variant: Variant.info,
          });
        }
        Toaster.show({
          text: `${lib.name} installed successfully`,
          variant: Variant.success,
        });
        yield put(installationSuccessful(lib));
      } else {
        yield put(installationFailed(lib));
      }
    } else {
      Toaster.show({
        text: installationOnWorker.error || "",
        variant: Variant.danger,
      });
      yield put(installationFailed(lib));
    }
  } catch (error) {
    yield put(installationFailed(lib));
  }
}

export default function* customLibsSaga() {
  yield all([
    takeLatest(ReduxActionTypes.FETCH_APP_LIB_INIT, fetchAppLibrariesSaga),
    takeEvery(ReduxActionTypes.LIB_INSTALL_INIT, installLibrarySaga),
  ]);
}
