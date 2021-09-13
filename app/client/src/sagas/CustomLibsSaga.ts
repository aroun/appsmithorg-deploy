import {
  installationFailed,
  installationSuccessful,
  unInstallationFailed,
  unInstallationSuccessful,
} from "actions/cutomLibsActions";
import { ApiResponse } from "api/ApiResponses";
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
import { addRemoveLibrariesSaga } from "./EvaluationsSaga";

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
          namespace?: string;
        } = yield call(addRemoveLibrariesSaga, libs[i].url);
        if (installationOnWorker.isLoaded) {
          libs[i].accessor = installationOnWorker.namespace;
          yield put(installationSuccessful(libs[i]));
          if (libs[i].jsonTypeDefinition) {
            try {
              TernServer.updateDef(
                libs[i].name,
                JSON.parse(libs[i].jsonTypeDefinition),
              );
            } catch (e) {
              Toaster.show({
                text: `Autocomplete might not work properly for ${libs[i].name}`,
                variant: Variant.warning,
              });
            }
          }
        }
      }
    }
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
  lib.url = lib.latest;
  const applicationId: string = yield select(getCurrentApplicationId);
  //Save library and trigger definition generator;
  try {
    const installationOnWorker: {
      isLoaded: boolean;
      error?: string;
      namespace?: string;
    } = yield call(addRemoveLibrariesSaga, lib.latest);
    if (installationOnWorker.isLoaded) {
      const response: ApiResponse = yield call(
        CustomLibsApi.installLibrary,
        applicationId,
        lib,
      );
      const isValid: boolean = yield call(validateResponse, response);
      if (isValid) {
        const responseLib = response.data;
        responseLib.accessor = installationOnWorker.namespace;
        try {
          TernServer.updateDef(
            lib.name,
            JSON.parse(responseLib.jsonTypeDefinition),
          );
        } catch (error) {
          Toaster.show({
            text: "Autocomplete might not work properly",
            variant: Variant.warning,
          });
        }
        Toaster.show({
          text: `${lib.name} installed successfully`,
          variant: Variant.success,
        });
        yield put(installationSuccessful(responseLib));
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

function* uninstallLibrary(action: ReduxAction<any>) {
  const lib = action.payload;
  try {
    const response: ApiResponse = yield call(
      CustomLibsApi.uninstallLibrary,
      lib,
    );
    const isValid: boolean = yield call(validateResponse, response);
    if (isValid) {
      yield call(addRemoveLibrariesSaga, [lib], true);
      yield put(unInstallationSuccessful(lib.id));
      Toaster.show({
        text: `${lib.name} uninstalled successfully`,
        variant: Variant.success,
      });
    } else {
      yield put(unInstallationFailed(lib));
    }
  } catch (e) {
    yield put(unInstallationFailed(lib));
  }
}

export default function* customLibsSaga() {
  yield all([
    takeLatest(ReduxActionTypes.FETCH_APP_LIB_INIT, fetchAppLibrariesSaga),
    takeEvery(ReduxActionTypes.LIB_INSTALL_INIT, installLibrarySaga),
    takeEvery(ReduxActionTypes.LIB_UNINSTALL_INIT, uninstallLibrary),
  ]);
}
