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

export abstract class BaseActionFunction {
  protected actionFunction: string;
  protected fields: FieldConfig[] = [];
  // The names assigned to the fields of an actions.
  // This will be assigned in the field config.
  abstract fieldNames: string[];

  protected constructor(actionFunction?: string) {
    if (!actionFunction) {
      this.actionFunction = "";
      this.initializeActionFunction();
    } else {
      this.actionFunction = actionFunction;
    }
    this.parseFunction();
  }
  // When creating a new action function, this method will be called
  // Base classes need to create the new function with default arguments here
  abstract initializeActionFunction(): void;

  public getValue(fieldName: string): string {
    const field = this.fields.find((field) => field.name === fieldName);
    if (!field) {
      throw Error("Field not found");
    }
    return this.handleGetValue(field);
  }

  /**
   * Override this function to change the functionality of getValue
   * @param field
   * @protected
   */
  protected handleGetValue(field: FieldConfig): string {
    return field.value;
  }
  public onValueChange(fieldName: string, value: string): string {
    const field = this.fields.find((field) => field.name === fieldName);
    if (!field) {
      throw Error("Field not found");
    }
    this.handleValueChange(field, value);
    return this.actionFunction;
  }

  /**
   * Override this function to change the functionality of onValueChange
   * @param field
   * @param value
   * @protected
   */
  protected handleValueChange(field: FieldConfig, value: string) {
    this.actionFunction =
      this.actionFunction.substring(0, field.node.start) +
      value +
      this.actionFunction.substring(field.node.end, this.actionFunction.length);
    this.parseFunction();
  }
  public getFields(): FieldConfig[] {
    return this.fields;
  }
  private parseFunction() {
    try {
      const args = getFunctionArguments(this.actionFunction);
      this.fields = args.map((arg, index) => ({
        name: this.fieldNames ? this.fieldNames[index] : (index + 1).toString(),
        value: arg.value,
        node: arg.node,
        fieldComponent: FieldComponent.TEXT_FIELD,
      }));
    } catch (e) {
      //TODO  Use the syntax error here for syntax error
    }
  }
}
