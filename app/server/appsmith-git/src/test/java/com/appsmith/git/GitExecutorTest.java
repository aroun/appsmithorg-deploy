package com.appsmith.git;

import com.appsmith.external.git.GitExecutor;
import com.appsmith.git.configurations.GitServiceConfig;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.nio.file.Paths;

@Slf4j
@RunWith(SpringRunner.class)
public class GitExecutorTest {

    @Autowired
    GitExecutor gitExecutor;

    @Autowired
    GitServiceConfig gitServiceConfig;

    private final String gitRemoteUrl = "git@github.com:appsmithorg/appsmith-docs.git";

    @Test
    public void cloneApplication_validRemoteUrlNonEmptyRepo_ThrowError() throws GitAPIException, IOException {
        try {
            gitExecutor.cloneApplication(
                    Paths.get(gitServiceConfig.getGitRootPath()+"orgId"+"appId"+"repoName"),
                    gitRemoteUrl,
                    "PVT_KEY",
                    "PUBLIC_KEY");
        } catch (Exception e) {
            assert e.getMessage().contains("The remote repo is not empty.");
        }
    }

    @Test
    public void cloneApplication_validEmptyRepo_Success() throws GitAPIException, IOException {

    }

    @Test
    public void connectApplication_validEmptyRepo_Success() throws GitAPIException, IOException {

    }
}