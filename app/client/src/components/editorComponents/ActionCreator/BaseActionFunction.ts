import { getFunctionArguments } from "workers/ast";

export enum FieldComponent {
  ACTION_SELECTOR = "ACTION_SELECTOR",
  ENUM_SELECTOR = "ENUM_SELECTOR",
  TEXT_FIELD = "TEXT_FIELD",
  NUMBER_FIELD = "NUMBER_FIELD",
  KEY_VALUE_FIELD = "KEY_VALUE_FIELD",
}

export type FieldConfig = {
  name: string;
  value: string;
  fieldComponent: FieldComponent;
};

export class BaseActionFunction {
  private actionFunction: string;
  private fields: FieldConfig[] = [];
  constructor(actionFunction: string) {
    this.actionFunction = actionFunction;
    // TODO support for default arguments
    this.parseFunction();
  }
  getValue(fieldName: string): string {
    // TODO find the value of the field name and send that
    return "";
  }
  onValueChange(fieldName: string, value: string) {
    // Update the value of a field and return the value
    // TODO
    return "";
  }
  getFields(): FieldConfig[] {
    return this.fields;
  }
  protected parseFunction() {
    const args = getFunctionArguments(this.actionFunction);
    this.fields = args.map((arg, index) => ({
      name: (index + 1).toString(),
      value: arg,
      fieldComponent: FieldComponent.TEXT_FIELD,
    }));
  }
}
