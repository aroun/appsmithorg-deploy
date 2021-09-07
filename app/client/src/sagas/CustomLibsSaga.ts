import { FetchApplicationPayload } from "actions/applicationActions";
import {
  installationFailed,
  installationSuccessful,
} from "actions/cutomLibsActions";
import { ApiResponse } from "api/ApiResponses";
import ApplicationApi from "api/ApplicationApi";
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
import ExtraLibraryClass from "utils/ExtraLibrary";
import { validateResponse } from "./ErrorSagas";
import { updateLibrariesSaga } from "./EvaluationsSaga";

export function* fetchAppLibrariesSaga(action: ReduxAction<any>) {
  const applicationId = action.payload.applicationId;
  try {
    const response: ApiResponse = yield call(
      ApplicationApi.fetchAppLibraries,
      applicationId,
    );
    const isValid: boolean = yield call(validateResponse, response);
    if (isValid) {
      const libs = response.data;
      for (let i = libs.length; i--; ) {
        const installationOnWorker: {
          isLoaded: boolean;
          error?: string;
        } = yield call(updateLibrariesSaga, libs[i].latest);
        if (installationOnWorker.isLoaded && libs[i].jsonTypeDefinition) {
          TernServer.updateDef("dayjs", libs[i].jsonTypeDefinition);
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
        ApplicationApi.installLibrary,
        applicationId,
        lib,
      );
      const isValid: boolean = yield call(validateResponse, response);
      if (isValid) {
        TernServer.updateDef(lib.name, response.data.jsonTypeDefinition);
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
