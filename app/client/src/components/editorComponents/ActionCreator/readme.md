#Requirements
 - Easy to add new actions/arguments
 - Actions can have variations of arguments
 - Object based arguments need to be supported
 - Ability to add .then / . catch workflow
 - Variations of same actions
 - Autocomplete and linting on each field
 - AST based parsing and editing
 - Argument validation support
 - Unlimited nesting
 - Arguments with default values
 - Dynamic bindings in subfields
 - support enum values
 - support for entity/property specific action


## Implementation notes

### Base action class
Create a base action class which all actions need to implement. This class defines
- The arguments and its structure (showAlert(@message, @type))
- how to create fields for this action
- how to read and edit fields
- if .then/.catch can be nested
- define required and optional arguments and default values
- define validation
- handle variations 
- Each action can fetch its information from the data tree as well

```typescript
class BaseAction {
  currentFunction: string; // the 
  
  arguemntConfig() {
    // define a config for the arguments and its fields    
  }
  
  onValueChange() {
    // handle the value updated in a field
  }
  
  getValue() {
    // get the value for this field
  }
  
}
function register() {
  // register this function and its arguments
}

```


### Action selector component
A Main action selector component is orchestrating all the actions and user inputs. It needs to
- parse the whole text, identify and render the action class components
- call the update function on the action field
- pass the linting errors
- create select action fields for more nesting


> Actions fit in the selector as lego pieces


