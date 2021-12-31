import { getFunctionArguments } from "workers/ast";
import { Node } from "acorn";

export enum FieldComponent {
  ACTION_SELECTOR = "ACTION_SELECTOR",
  ENUM_SELECTOR = "ENUM_SELECTOR",
  TEXT_FIELD = "TEXT_FIELD",
  NUMBER_FIELD = "NUMBER_FIELD",
  KEY_VALUE_FIELD = "KEY_VALUE_FIELD",
}

export type FieldDetails = {
  name: string;
  value: string;
  fieldComponent: FieldComponent;
  node: Node;
};

export type FieldConfig = {
  name: string;
  fieldComponent: FieldComponent;
};

export abstract class BaseActionFunction {
  static funcName: string;
  protected actionFunction: string;
  protected fields: FieldDetails[] = [];
  // The names assigned to the fields of an actions.
  // This will be assigned in the field config.
  protected abstract fieldConfig: FieldConfig[];

  protected constructor(actionFunction?: string) {
    this.actionFunction = actionFunction || "";
  }

  parseFunction() {
    if (!this.actionFunction) {
      this.initializeActionFunction();
    }
    this.parseFields();
  }

  // When creating a new action function, this method will be called
  // Base classes need to create the new function with default arguments here
  protected abstract initializeActionFunction(): void;

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
  protected handleGetValue(field: FieldDetails): string {
    return field.value;
  }
  public onValueChange(fieldName: string, value: string): string {
    const field = this.fields.find((field) => field.name === fieldName);
    if (!field) {
      throw Error("Field not found");
    }
    this.handleValueChange(field, value);
    this.parseFields();
    return this.actionFunction;
  }

  /**
   * Override this function to change the functionality of onValueChange
   * @param field
   * @param value
   * @protected
   */
  protected handleValueChange(field: FieldDetails, value: string) {
    this.actionFunction =
      this.actionFunction.substring(0, field.node.start) +
      value +
      this.actionFunction.substring(field.node.end, this.actionFunction.length);
  }
  public getFields(): FieldDetails[] {
    return this.fields;
  }
  private parseFields() {
    try {
      const args = getFunctionArguments(this.actionFunction);
      this.fields = this.fieldConfig.map((config, index) => {
        const arg = args[index];
        return {
          name: config.name || (index + 1).toString(),
          value: arg.value,
          node: arg.node,
          fieldComponent: config.fieldComponent || FieldComponent.TEXT_FIELD,
        };
      });
    } catch (e) {
      //TODO  Use the syntax error here for syntax error
    }
  }
}
