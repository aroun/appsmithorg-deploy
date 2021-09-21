const gitSyncLoctors = require("../../../../locators/gitSyncLocators.json");
const homePage = require("../../../../locators/HomePage.json");

const GITHUB_API_BASE = "https://api.github.com";

let generatedKey;

describe("Git sync connect to repo", function() {
  // create a new repo
  before(() => {
    cy.request({
      method: "POST",
      url: `${GITHUB_API_BASE}/user/repos`,
      headers: {
        Authorization: `token ${Cypress.env("GITHUB_PERSONAL_ACCESS_TOKEN")}`,
      },
      body: {
        name: Cypress.env("GITSYNC_TEST_REPO_NAME"),
      },
    });
  });

  it("connects successfully", function() {
    cy.get(homePage.publishButton).click();

    // todo: check for the initial state: init git connection button, regular deploy button

    // add the test repo and click on submit btn
    cy.intercept("POST", "/api/v1/applications/ssh-keypair/*").as(
      "generateKey",
    );
    cy.get(gitSyncLoctors.gitRepoInput).type(
      Cypress.env("GITSYNC_TEST_REPO_NAME"),
    );
    cy.get(gitSyncLoctors.addRepoSubmitBtn).click();
    cy.wait("@generateKey").then((result) => {
      generatedKey = result.response.body.data.publicKey;
      generatedKey = generatedKey.slice(0, generatedKey.length - 1);

      // fetch the generated key and post to the github repo
      cy.request({
        method: "POST",
        url: `${GITHUB_API_BASE}/repos/${Cypress.env(
          "TEST_GITHUB_USER_NAME",
        )}/${Cypress.env("GITSYNC_TEST_REPO_NAME")}/keys`,
        headers: {
          Authorization: `token ${Cypress.env("GITHUB_PERSONAL_ACCESS_TOKEN")}`,
        },
        body: {
          title: "key0",
          key: generatedKey,
        },
      });

      // click on the connect button and verify
    });
  });

  // delete the created repo
  after(() => {
    cy.request({
      method: "DELETE",
      url: `${GITHUB_API_BASE}/repos/${Cypress.env(
        "TEST_GITHUB_USER_NAME",
      )}/${Cypress.env("GITSYNC_TEST_REPO_NAME")}`,
      headers: {
        Authorization: `token ${Cypress.env("GITHUB_PERSONAL_ACCESS_TOKEN")}`,
      },
    });
  });
});
