import {
  BaseActionFunction,
  FieldComponent,
} from "components/editorComponents/ActionCreator/BaseActionFunction";

describe("BaseActionFunction", () => {
  it("gets the field config", () => {
    const myFunction = `actionFunc("a", () => { return "b" }, C)`;
    const myFunctionInstance = new BaseActionFunction(myFunction);
    const fieldConfig = myFunctionInstance.getFields();
    const expectedFieldConfig = [
      {
        name: "1",
        value: `"a"`,
        fieldComponent: FieldComponent.TEXT_FIELD,
      },
      {
        name: "2",
        value: `() => { return "b" }`,
        fieldComponent: FieldComponent.TEXT_FIELD,
      },
      {
        name: "3",
        value: "C",
        fieldComponent: FieldComponent.TEXT_FIELD,
      },
    ];

    expect(fieldConfig).toStrictEqual(expectedFieldConfig);
  });
});
