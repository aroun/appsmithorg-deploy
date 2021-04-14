import { ReduxActionTypes, ReduxAction } from "constants/ReduxActionConstants";
import { createApplicationSaga } from "./ApplicationSagas";
import { CreateApplicationResponse } from "api/ApplicationApi";

import { put, take } from "redux-saga/effects";
import { cloneableGenerator } from "@redux-saga/testing-utils";

import { AppIconCollection } from "components/ads/AppIcon";
import { appColors } from "constants/DefaultTheme";

test("doStuffThenChangeColor", (assert) => {
  const applicationPayload = {
    applicationName: "Untitled application 58",
    color: appColors[1],
    icon: AppIconCollection[1],
    orgId: "606d97b7b63c1b7a7e6e1afd",
    resolve: () => ({}),
    reject: () => ({}),
  };
  const applicationAction = {
    type: ReduxActionTypes.CREATE_APPLICATION_INIT,
    payload: applicationPayload,
  };
  console.log("before");

  // assert.equal(
  //     data.gen.next().value,
  //     1,
  //     'it should yield 1'
  // );
  const gen = createApplicationSaga(applicationAction);

  console.log("gen", gen.next());
});
