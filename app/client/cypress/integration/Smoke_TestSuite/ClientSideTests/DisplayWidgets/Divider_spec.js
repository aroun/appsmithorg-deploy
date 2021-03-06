const dsl = require("../../../../fixtures/DividerDsl.json");
const explorer = require("../../../../locators/explorerlocators.json");

describe("Divider Widget Functionality", function() {
  beforeEach(() => {
    cy.addDsl(dsl);
  });

  it("Add new Divider", () => {
    cy.get(explorer.addWidget).click();
    cy.dragAndDropToCanvas("dividerwidget", { x: 300, y: 300 });
    cy.get(".t--divider-widget").should("exist");
  });

  it("Open Existing Divider from created Widgets list", () => {
    cy.get(".widgets").click();
    cy.get(".t--entity-name:contains(Divider1)").click();
  });
});
