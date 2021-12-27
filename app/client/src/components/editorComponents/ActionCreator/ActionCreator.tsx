import React, { ChangeEvent } from "react";
import { getFunctionCalls } from "workers/ast";
import { BaseActionFunction } from "components/editorComponents/ActionCreator/BaseActionFunction";
import {
  ControlWrapper,
  FieldWrapper,
} from "components/propertyControls/StyledControls";
import { InputText } from "components/propertyControls/InputTextControl";
import log from "loglevel";

type Props = {
  value: string;
  onValueChange: (newValue: string) => void;
};

function ActionCreator(props: Props) {
  const actions = getFunctionCalls(props.value);
  log.debug(actions, props.value);
  return (
    <>
      {actions.map((action) => {
        const actionFunction = new BaseActionFunction(action.functionCall);
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
                        if (typeof event === "object" && "target" in event) {
                          actionFunction.onValueChange(
                            field.name,
                            event.target.value,
                          );
                        } else {
                          actionFunction.onValueChange(field.name, event);
                        }
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
    </>
  );
}

export default ActionCreator;
