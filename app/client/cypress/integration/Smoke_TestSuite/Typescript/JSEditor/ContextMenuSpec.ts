import { AggregateHelper } from "../../../../support/Pages/AggregateHelper";
import { JSEditor } from "../../../../support/Pages/JSEditor";

const agHelper = new AggregateHelper();
const jsEditor = new JSEditor();

describe("Validate basic operations on Entity explorer JSEditor structure", () => {

  let pageId = "Page1"

  it("1. Validate JSObject creation & Run", () => {
    jsEditor.CreateJSObject('return "Hello World";');
    agHelper.ValidateEntityPresenceInExplorer("JSObject1")
    agHelper.expandCollapseEntity("JSObject1")
    jsEditor.validateDefaultJSObjProperties("JSObject1")
  });

  it("2. Validate Rename JSObject from Form Header", function() {
    jsEditor.RenameJSObjFromForm("RenamedJSObject")
    agHelper.ValidateEntityPresenceInExplorer("RenamedJSObject");
    jsEditor.validateDefaultJSObjProperties("RenamedJSObject")
  });

  it("3. Validate Copy JSObject", function() {
    agHelper.ActionContextMenuByEntityName("RenamedJSObject", "Copy to page", pageId)
    cy.wait("@createNewJSCollection").should(
      "have.nested.property",
      "response.body.responseMeta.status",
      201,
    );
    agHelper.ValidateEntityPresenceInExplorer("RenamedJSObjectCopy")
    agHelper.expandCollapseEntity("RenamedJSObjectCopy")
    jsEditor.validateDefaultJSObjProperties("RenamedJSObjectCopy")
  });

  it("4. Validate Rename JSObject from Entity Explorer", function() {
    jsEditor.RenameJSObjFromExplorer("RenamedJSObject", "ExplorerRenamed")
    agHelper.ValidateEntityPresenceInExplorer("ExplorerRenamed");
    jsEditor.validateDefaultJSObjProperties("ExplorerRenamed")
  });

  it("5. Validate Move JSObject", function() {
    pageId = 'Page2'
    agHelper.AddNewPage();
    agHelper.ValidateEntityPresenceInExplorer(pageId);
    agHelper.ActionContextMenuByEntityName("RenamedJSObjectCopy", "Move to page", pageId)
    agHelper.ValidateEntityPresenceInExplorer("RenamedJSObjectCopy")
    agHelper.expandCollapseEntity("RenamedJSObjectCopy")
    jsEditor.validateDefaultJSObjProperties("RenamedJSObjectCopy")
  });

  it("6. Validate Deletion of JSObject", function() {
    agHelper.ActionContextMenuByEntityName("RenamedJSObjectCopy", "Delete")
    agHelper.ActionContextMenuByEntityName("ExplorerRenamed", "Delete")
  });

});