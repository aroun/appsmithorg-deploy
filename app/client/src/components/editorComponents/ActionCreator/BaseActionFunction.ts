import { getFunctionArguments } from "workers/ast";
import { Node } from "acorn";

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
  node: Node;
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
    const field = this.fields.find((field) => field.name === fieldName);
    if (!field) {
      throw Error("Field not found");
    }
    return field.value;
  }
  onValueChange(fieldName: string, value: string): string {
    const field = this.fields.find((field) => field.name === fieldName);
    if (!field) {
      throw Error("Field not found");
    }
    this.actionFunction =
      this.actionFunction.substring(0, field.node.start) +
      value +
      this.actionFunction.substring(field.node.end, this.actionFunction.length);
    this.parseFunction();
    return this.actionFunction;
  }
  getFields(): FieldConfig[] {
    return this.fields;
  }
  protected parseFunction() {
    try {
      const args = getFunctionArguments(this.actionFunction);
      this.fields = args.map((arg, index) => ({
        name: (index + 1).toString(),
        value: arg.value,
        node: arg.node,
        fieldComponent: FieldComponent.TEXT_FIELD,
      }));
    } catch (e) {
      //TODO  Use the syntax error here for syntax error
    }
  }
}
