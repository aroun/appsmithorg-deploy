import {
  BaseActionFunction,
  FieldComponent,
  FieldConfig,
} from "components/editorComponents/ActionCreator/BaseActionFunction";

class ShowAlert extends BaseActionFunction {
  static funcName = "showAlert";

  protected fieldConfig: FieldConfig[] = [
    { name: "message", fieldComponent: FieldComponent.TEXT_FIELD },
    { name: "type", fieldComponent: FieldComponent.ENUM_SELECTOR },
  ];

  constructor(...args: any[]) {
    super(...args);
  }

  initializeActionFunction(): void {
    this.actionFunction = `showAlert("Hello World", "info")`;
  }
}

export default ShowAlert;
