import React, { ChangeEvent } from "react";
import { getFunctionCalls } from "workers/ast";
import { BaseActionFunction } from "components/editorComponents/ActionCreator/BaseActionFunction";
import {
  ControlWrapper,
  FieldWrapper,
} from "components/propertyControls/StyledControls";
import { InputText } from "components/propertyControls/InputTextControl";
import { Node } from "acorn";

type Props = {
  value: string;
  onValueChange: (newValue: string) => void;
};

const registeredActionFunctions = new Map<string, BaseActionFunction>();

export const registerActionFunction = (
  name: string,
  handlerClass: BaseActionFunction,
) => {
  registeredActionFunctions.set(name, handlerClass);
};

function ActionCreator(props: Props) {
  // TODO handle binding brackets {{ }}
  const actions = getFunctionCalls(props.value);
  const updateFieldValue = (
    value: string,
    fieldName: string,
    action: { name: string; functionCall: string; node: Node },
    actionFunction: BaseActionFunction,
  ) => {
    const newActionFunctionValue = actionFunction.onValueChange(
      fieldName,
      value,
    );
    const newValue =
      props.value.substring(0, action.node.start) +
      newActionFunctionValue +
      props.value.substring(action.node.end, props.value.length);
    props.onValueChange(newValue);
  };
  return (
    <>
      {actions.map((action) => {
        // TODO get correct ActionFunction class based on the name
        // Need to register all possible names with the class
        const HandlerClass = registeredActionFunctions.get(action.name);
        if (!HandlerClass) {
          throw Error("No action function registered");
        }
        const actionFunction = new HandlerClass(action.functionCall);
        const fields = actionFunction.getFields();
        return (
          <>
            <label>{action.name}</label>
            {fields.map((field) => {
              return (
                <FieldWrapper key={`${action.name}:${field.name}`}>
                  <ControlWrapper isAction>
                    <label>{field.name}</label>
                    <InputText
                      label={field.name}
                      onChange={(event: ChangeEvent<any> | string) => {
                        let value: string;
                        if (typeof event === "object" && "target" in event) {
                          value = event.target.value;
                        } else {
                          value = event;
                        }
                        updateFieldValue(
                          value,
                          field.name,
                          action,
                          actionFunction,
                        );
                      }}
                      value={field.value}
                    />
                  </ControlWrapper>
                </FieldWrapper>
              );
            })}
          </>
        );
      })}
      {/* TODO Render the action selector dropdown to append functions */}
    </>
  );
}

export default ActionCreator;
