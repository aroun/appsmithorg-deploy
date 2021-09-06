import { FetchApplicationPayload } from "actions/applicationActions";
import {
  installationFailed,
  installationSuccessful,
} from "actions/cutomLibsActions";
import { ApiResponse } from "api/ApiResponses";
import ApplicationApi from "api/ApplicationApi";
import {
  ReduxAction,
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "constants/ReduxActionConstants";
import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";
import TernServer from "utils/autocomplete/TernServer";
import ExtraLibraryClass from "utils/ExtraLibrary";
import { validateResponse } from "./ErrorSagas";
import { updateLibrariesSaga } from "./EvaluationsSaga";

export function* fetchAppLibrariesSaga(
  action: ReduxAction<FetchApplicationPayload>,
) {
  //   const { applicationId } = action.payload;
  try {
    const response: ApiResponse = yield call(ApplicationApi.fetchAppLibraries);
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
    yield put({ type: ReduxActionTypes.START_EVALUATION });
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
  //Save library and trigger definition generator;
  try {
    // const status = yield call(scriptService.load.bind(scriptService), [lib]);
    const installationOnWorker: {
      isLoaded: boolean;
      error?: string;
    } = yield call(updateLibrariesSaga, lib.latest);
    if (installationOnWorker.isLoaded) {
      const extraLibs = ExtraLibraryClass.getInstance();
      extraLibs.addLibrary({
        ...lib,
        lib: window[lib.name],
      });
    }
    yield put(installationSuccessful(lib));
  } catch (error) {
    yield put(installationFailed(lib));
    yield put({
      type: ReduxActionErrorTypes.FETCH_LIBRARY_ERROR,
      payload: {
        error,
      },
    });
  }
}

export default function* customLibsSaga() {
  yield all([
    takeLatest(ReduxActionTypes.FETCH_APPLICATION_INIT, fetchAppLibrariesSaga),
    takeEvery(ReduxActionTypes.LIB_INSTALL_INIT, installLibrarySaga),
  ]);
}
