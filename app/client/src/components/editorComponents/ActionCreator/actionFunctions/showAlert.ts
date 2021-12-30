import { BaseActionFunction } from "components/editorComponents/ActionCreator/BaseActionFunction";
import { registerActionFunction } from "components/editorComponents/ActionCreator/ActionCreator";

class ShowAlert extends BaseActionFunction {
  static funcName = "showAlert";
  fieldNames: string[] = ["message", "type"];

  constructor(...args: any[]) {
    super(...args);
  }

  initializeActionFunction(): void {
    this.actionFunction = `showAlert("Hello World", "info")`;
  }
}

export default ShowAlert;

registerActionFunction("showAlert", ShowAlert);
