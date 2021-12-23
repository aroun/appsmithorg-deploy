import gitSyncLocators from "../../../../locators/gitSyncLocators";
const homePage = require("../../../../locators/HomePage");
const commonLocators = require("../../../../locators/commonlocators.json");

const httpsRepoURL = "https://github.com/test/test.git";
const invalidURL = "test";
const invalidURLDetectedOnTheBackend = "test@";

const invalidEmail = "test";
const invalidEmailWithAmp = "test@hello";

const GITHUB_API_BASE = "https://api.github.com";

let repoName;
let generatedKey;
let windowOpenSpy;
let githubDeployKeyId;
const owner = Cypress.env("TEST_GITHUB_USER_NAME");
describe("Git sync modal: connect tab", function() {
  before(() => {
    cy.generateUUID().then((uid) => {
      repoName = uid;
      cy.createTestGithubRepo(repoName);
    });
  });

  beforeEach(() => {
    cy.intercept(
      {
        url: "api/v1/git/connect/*",
        hostname: window.location.host,
      },
      (req) => {
        req.headers["origin"] = "Cypress";
      },
    );
  });

  it("validates repo URL", function() {
    // open gitSync modal
    cy.get(homePage.deployPopupOptionTrigger).click();
    cy.get(homePage.connectToGitBtn).click();

    cy.get(gitSyncLocators.gitRepoInput).type(`{selectAll}${httpsRepoURL}`);
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO());
    cy.get(gitSyncLocators.generateDeployKeyBtn).should("not.exist");

    cy.get(gitSyncLocators.gitRepoInput).type(`{selectAll}${invalidURL}`);
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO());
    cy.get(gitSyncLocators.generateDeployKeyBtn).should("not.exist");

    // generate key button should be disappeared if empty repo
    cy.get(gitSyncLocators.gitRepoInput).type(`{selectAll}${""}`);
    cy.get(gitSyncLocators.generateDeployKeyBtn).should("not.exist");

    cy.get(gitSyncLocators.gitRepoInput).type(
      `{selectAll}git@github.com:${owner}/${repoName}.git`,
    );
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO()).should(
      "not.exist",
    );

    cy.get(gitSyncLocators.generateDeployKeyBtn).should("not.be.disabled");

    cy.intercept("POST", "/api/v1/applications/ssh-keypair/*").as(
      "generateKey",
    );

    // Stubbing window.open
    cy.window().then((window) => {
      windowOpenSpy = cy.stub(window, "open").callsFake((url) => {
        expect(url.startsWith("https://docs.appsmith.com/")).to.be.true;
        windowOpenSpy.restore();
      });
    });
    cy.get(gitSyncLocators.learnMoreSshUrl).click();

    cy.get(gitSyncLocators.generateDeployKeyBtn).click();

    cy.wait("@generateKey").then((result) => {
      generatedKey = result.response.body.data.publicKey;
    });

    // generate key learn more
    cy.window().then((window) => {
      windowOpenSpy = cy.stub(window, "open").callsFake((url) => {
        expect(
          url.startsWith(
            "https://docs.github.com/en/developers/overview/managing-deploy-keys",
          ),
        ).to.be.true;
        windowOpenSpy.restore();
      });
    });
    cy.get(gitSyncLocators.learnMoreDeployKey).click();
  });

  it("validates copy key", function() {
    cy.window().then((win) => {
      cy.stub(win, "prompt")
        .returns(win.prompt)
        .as("copyToClipboardPrompt");
    });

    cy.get(gitSyncLocators.copySshKey).click();
    cy.get("@copyToClipboardPrompt").should("be.called");
    cy.get("@copyToClipboardPrompt").should((prompt) => {
      expect(prompt.args[0][1]).to.equal(generatedKey);
      generatedKey = generatedKey.slice(0, generatedKey.length - 1);
    });
  });

  it("validates repo url input after key generation", function() {
    cy.get(gitSyncLocators.gitRepoInput).type(`{selectAll}${httpsRepoURL}`);
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO());
    cy.get(gitSyncLocators.connectSubmitBtn).should("be.disabled");

    cy.get(gitSyncLocators.gitRepoInput).type(`{selectAll}${invalidURL}`);
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO());
    cy.get(gitSyncLocators.connectSubmitBtn).should("be.disabled");

    cy.get(gitSyncLocators.gitRepoInput).type(
      `{selectAll}git@github.com:${owner}/${repoName}.git`,
    );
    cy.contains(Cypress.env("MESSAGES").PASTE_SSH_URL_INFO()).should(
      "not.exist",
    );
    cy.get(gitSyncLocators.connectSubmitBtn).should("not.be.disabled");
  });

  it("validates git user config", function() {
    cy.get(gitSyncLocators.useGlobalGitConfig).click();

    // name empty invalid
    cy.get(gitSyncLocators.gitConfigNameInput).clear();
    cy.get(gitSyncLocators.gitConfigEmailInput).clear();
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").AUTHOR_NAME_CANNOT_BE_EMPTY());
    cy.contains(Cypress.env("MESSAGES").FORM_VALIDATION_INVALID_EMAIL());

    cy.get(gitSyncLocators.gitConfigNameInput).type(`{selectAll}${owner}`);
    cy.get(gitSyncLocators.gitConfigEmailInput).clear();
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").FORM_VALIDATION_INVALID_EMAIL());

    cy.get(gitSyncLocators.gitConfigEmailInput).type(
      `{selectAll}${Cypress.env("USERNAME")}`,
    );
    cy.get(gitSyncLocators.gitConfigNameInput).clear();
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").AUTHOR_NAME_CANNOT_BE_EMPTY());

    // validate email
    cy.get(gitSyncLocators.gitConfigNameInput).type(`{selectAll}${owner}`);
    cy.get(gitSyncLocators.gitConfigEmailInput).type(
      `{selectAll}${invalidEmail}`,
    );
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").FORM_VALIDATION_INVALID_EMAIL());

    cy.get(gitSyncLocators.gitConfigEmailInput).type(
      `{selectAll}${invalidEmailWithAmp}`,
    );
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").FORM_VALIDATION_INVALID_EMAIL());

    cy.get(gitSyncLocators.gitConfigEmailInput).type(
      `{selectAll}${Cypress.env("USERNAME")}`,
    );
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.contains(Cypress.env("MESSAGES").AUTHOR_NAME_CANNOT_BE_EMPTY()).should(
      "not.exist",
    );
    cy.contains(Cypress.env("MESSAGES").FORM_VALIDATION_INVALID_EMAIL()).should(
      "not.exist",
    );

    // check git global config
    cy.get(gitSyncLocators.useGlobalGitConfig).click();
    cy.get(gitSyncLocators.gitConfigNameInput).should("be.disabled");
    cy.get(gitSyncLocators.gitConfigEmailInput).should("be.disabled");

    cy.window()
      .its("store")
      .invoke("getState")
      .then((state) => {
        const { authorEmail, authorName } = state.ui.gitSync.globalGitConfig;
        cy.get(gitSyncLocators.gitConfigNameInput).should(
          "have.value",
          authorName,
        );
        cy.get(gitSyncLocators.gitConfigEmailInput).should(
          "have.value",
          authorEmail,
        );
      });
  });

  it("validates submit errors", function() {
    cy.get(gitSyncLocators.useGlobalGitConfig).click();
    cy.get(gitSyncLocators.gitConfigNameInput).type(`{selectAll}${owner}`);
    cy.get(gitSyncLocators.gitConfigEmailInput).type(
      `{selectAll}${Cypress.env("USERNAME")}`,
    );

    cy.get(gitSyncLocators.gitRepoInput)
      .click({ force: true })
      .type(`{selectAll}${invalidURLDetectedOnTheBackend}`);
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.wait("@connectGitRepo");
    cy.contains("Remote URL is incorrect!");

    cy.get(gitSyncLocators.gitRepoInput).type(
      `{selectAll}git@github.com:${owner}-test/${repoName}.git`,
      {
        force: true,
      },
    );
    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.get(gitSyncLocators.connetStatusbar).should("exist");
    cy.wait("@connectGitRepo");

    cy.contains("SSH Key is not configured properly");

    cy.get(gitSyncLocators.gitRepoInput).type(
      `{selectAll}git@github.com:${owner}/${repoName}.git`,
      {
        force: true,
      },
    );

    cy.request({
      method: "POST",
      url: `${GITHUB_API_BASE}/repos/${Cypress.env(
        "TEST_GITHUB_USER_NAME",
      )}/${repoName}/keys`,
      headers: {
        Authorization: `token ${Cypress.env("GITHUB_PERSONAL_ACCESS_TOKEN")}`,
      },
      body: {
        title: "key0",
        key: generatedKey,
        read_only: true,
      },
    }).then((response) => {
      githubDeployKeyId = response.body.id;
    });

    cy.get(gitSyncLocators.connectSubmitBtn).click();
    cy.get(gitSyncLocators.connetStatusbar).should("exist");
    cy.wait("@connectGitRepo");

    cy.contains("SSH Key is not configured properly");

    // read document clicking test
    cy.get(gitSyncLocators.readDocument).should("exist");
    cy.window().then((window) => {
      windowOpenSpy = cy.stub(window, "open").callsFake((url) => {
        expect(url.startsWith("https://docs.appsmith.com")).to.be.true;
        windowOpenSpy.restore();
      });
    });
    cy.get(gitSyncLocators.readDocument).click();
    cy.get(gitSyncLocators.closeGitSyncModal).click();
  });

  after(() => {
    cy.deleteTestGithubRepo(repoName);
  });
});
