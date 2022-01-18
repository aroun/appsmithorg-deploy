package com.appsmith.server.services.ce;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.domains.Application;
import com.appsmith.server.domains.ApplicationMode;
import com.appsmith.server.domains.Theme;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import com.appsmith.server.repositories.ApplicationRepository;
import com.appsmith.server.repositories.ThemeRepository;
import com.appsmith.server.repositories.ce.ThemeRepositoryCE;
import com.appsmith.server.services.AnalyticsService;
import com.appsmith.server.services.BaseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.util.function.Tuples;

import javax.validation.Validator;

import static com.appsmith.server.acl.AclPermission.MANAGE_APPLICATIONS;

@Slf4j
public class ThemeServiceCEImpl extends BaseService<ThemeRepositoryCE, Theme, String> implements ThemeServiceCE {

    private final ApplicationRepository applicationRepository;
    private String defaultThemeId;  // acts as a simple cache so that we don't need to fetch from DB always

    public ThemeServiceCEImpl(Scheduler scheduler, Validator validator, MongoConverter mongoConverter, ReactiveMongoTemplate reactiveMongoTemplate, ThemeRepository repository, AnalyticsService analyticsService, ApplicationRepository applicationRepository) {
        super(scheduler, validator, mongoConverter, reactiveMongoTemplate, repository, analyticsService);
        this.applicationRepository = applicationRepository;
    }

    @Override
    public Mono<Theme> create(Theme resource) {
        return repository.save(resource);
    }

    @Override
    public Mono<Theme> update(String s, Theme resource) {
        // we don't allow to update a theme by id, user can only update a theme under their application
        throw new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION);
    }

    @Override
    public Mono<Theme> getById(String s) {
        // we don't allow to get a theme by id from DB
        throw new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION);
    }

    @Override
    public Flux<Theme> get(MultiValueMap<String, String> params) {
        // we don't allow to get all themes from DB
        throw new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION);
    }

    @Override
    public Mono<Theme> getApplicationTheme(String applicationId, ApplicationMode applicationMode) {
        return applicationRepository.findById(applicationId, AclPermission.READ_APPLICATIONS)
                .switchIfEmpty(Mono.error(
                        new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, FieldName.APPLICATION, applicationId))
                )
                .flatMap(application -> {
                    String themeId = application.getEditModeThemeId();
                    if(applicationMode == ApplicationMode.PUBLISHED) {
                        themeId = application.getPublishedModeThemeId();
                    }
                    if(!StringUtils.isEmpty(themeId)) {
                        return repository.findById(themeId);
                    } else { // theme id is not present, return default theme
                        return repository.getSystemThemeByName(Theme.DEFAULT_THEME_NAME);
                    }
                });
    }

    @Override
    public Flux<Theme> getApplicationThemes(String applicationId) {
        return repository.getApplicationThemes(applicationId);
    }

    @Override
    public Mono<Theme> updateTheme(String applicationId, Theme resource) {
        return applicationRepository.findById(applicationId, AclPermission.MANAGE_APPLICATIONS)
                .flatMap(application -> {
                    // makes sure user has permission to edit application and an application exists by this applicationId
                    // check if this application has already a customized them
                    return saveThemeForApplication(application.getEditModeThemeId(), resource, applicationId, ApplicationMode.EDIT);
                });
    }

    @Override
    public Mono<Theme> changeCurrentTheme(String newThemeId, String applicationId) {
        Mono<Theme> newThemeMono = repository.findById(newThemeId).cache();
        // set provided theme to application and return that theme object
        Mono<Theme> setAppThemeMono = applicationRepository.setAppTheme(
                applicationId, newThemeId,null, MANAGE_APPLICATIONS
        ).then(newThemeMono);

        // in case a customized theme was set to application, we need to delete that
        return applicationRepository.findById(applicationId, AclPermission.MANAGE_APPLICATIONS)
                .switchIfEmpty(Mono.error(
                        new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, FieldName.APPLICATION, applicationId))
                )
                .flatMap(application -> repository.findById(application.getEditModeThemeId())
                        .defaultIfEmpty(new Theme())
                        .zipWith(newThemeMono)
                        .flatMap(themeTuple2 -> {
                            Theme currentTheme = themeTuple2.getT1();
                            Theme newTheme = themeTuple2.getT2();
                            if(!newTheme.isSystemTheme() && !applicationId.equals(newTheme.getApplicationId())) {
                                // new theme is neither a system theme nor belongs to this application, throw error
                                return Mono.error(new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION));
                            }
                            if (StringUtils.hasLength(currentTheme.getId()) && !currentTheme.isSystemTheme()
                                    && !StringUtils.hasLength(currentTheme.getApplicationId())) {
                                // current theme is neither a system theme nor app theme, delete the user customizations
                                return repository.delete(currentTheme).then(setAppThemeMono);
                            }
                            return setAppThemeMono;
                        })
                );
    }

    @Override
    public Mono<String> getDefaultThemeId() {
        if(StringUtils.isEmpty(defaultThemeId)) {
            return repository.getSystemThemeByName(Theme.DEFAULT_THEME_NAME).map(theme -> {
                defaultThemeId = theme.getId();
                return theme.getId();
            });
        }
        return Mono.just(defaultThemeId);
    }

    @Override
    public Mono<Theme> cloneThemeToApplication(String srcThemeId, String destApplicationId) {
        return applicationRepository.findById(destApplicationId, MANAGE_APPLICATIONS).flatMap(application ->
                // make sure the current user has permission to manage application
                repository.findById(srcThemeId).flatMap(theme -> {
                    if (theme.isSystemTheme()) { // it's a system theme, no need to copy
                        return Mono.just(theme);
                    } else { // it's a customized theme, create a copy and return the copy
                        theme.setId(null); // setting id to null so that save method will create a new instance
                        if(StringUtils.hasLength(theme.getApplicationId())) { // this custom theme was saved
                            theme.setApplicationId(destApplicationId); // save for new app too
                            theme.setOrganizationId(application.getOrganizationId());
                        }
                        return repository.save(theme);
                    }
                })
        );
    }

    /**
     * Publishes a theme from edit mode to published mode
     * @param applicationId application id
     * @return Mono of theme object that was set in published mode
     */
    @Override
    public Mono<Theme> publishTheme(String applicationId) {
        // fetch application to make sure user has permission to manage this application
        return applicationRepository.findById(applicationId, MANAGE_APPLICATIONS).flatMap(application -> {
            Mono<Theme> editModeThemeMono;
            if(!StringUtils.hasLength(application.getEditModeThemeId())) { // theme id is empty, use the default theme
                editModeThemeMono = repository.getSystemThemeByName(Theme.LEGACY_THEME_NAME);
            } else { // theme id is not empty, fetch it by id
                editModeThemeMono = repository.findById(application.getEditModeThemeId());
            }

            return editModeThemeMono.flatMap(editModeTheme -> {
                if (editModeTheme.isSystemTheme()) {  // system theme is set as edit mode theme
                    // Delete published mode theme if it was a copy of custom theme
                    return deletePublishedCustomizedThemeCopy(application.getPublishedModeThemeId()).then(
                            // Set the system theme id as edit and published mode theme id to application object
                            applicationRepository.setAppTheme(
                                    applicationId, editModeTheme.getId(), editModeTheme.getId(), MANAGE_APPLICATIONS
                            )
                    ).thenReturn(editModeTheme);
                } else {  // a customized theme is set as edit mode theme, copy that theme for published mode
                    return saveThemeForApplication(
                            application.getPublishedModeThemeId(), editModeTheme, applicationId, ApplicationMode.PUBLISHED
                    );
                }
            });
        });
    }

    /**
     * Creates a new theme if Theme with provided themeId is a system theme.
     * It sets the properties from the provided theme resource to the existing or newly created theme.
     * It'll also update the application if a new theme was created.
     * @param currentThemeId ID of the existing theme that might be updated
     * @param targetThemeResource new theme DTO that'll be stored as a new theme or override the existing theme
     * @param applicationId Application that contains the theme
     * @param applicationMode In which mode this theme will be set
     * @return Updated or newly created theme Publisher
     */
    private Mono<Theme> saveThemeForApplication(String currentThemeId, Theme targetThemeResource, String applicationId, ApplicationMode applicationMode) {
        return repository.findById(currentThemeId)
                .flatMap(currentTheme -> {
                    // set the edit mode values to published mode theme
                    currentTheme.setConfig(targetThemeResource.getConfig());
                    currentTheme.setStylesheet(targetThemeResource.getStylesheet());
                    currentTheme.setProperties(targetThemeResource.getProperties());
                    if(StringUtils.hasLength(targetThemeResource.getName())) {
                        currentTheme.setName(targetThemeResource.getName());
                    }
                    boolean newThemeCreated = false;
                    if (currentTheme.isSystemTheme()) {
                        // if this is a system theme, create a new one
                        currentTheme.setId(null); // setting id to null will create a new theme
                        currentTheme.setSystemTheme(false);
                        newThemeCreated = true;
                    }
                    return repository.save(currentTheme).zipWith(Mono.just(newThemeCreated));
                }).flatMap(savedThemeTuple -> {
                    Theme theme = savedThemeTuple.getT1();
                    if (savedThemeTuple.getT2()) { // new theme created, update the application
                        if(applicationMode == ApplicationMode.EDIT) {
                            return applicationRepository.setAppTheme(
                                    applicationId, theme.getId(), null, MANAGE_APPLICATIONS
                            ).thenReturn(theme);
                        } else {
                            return applicationRepository.setAppTheme(
                                    applicationId, null, theme.getId(), MANAGE_APPLICATIONS
                            ).thenReturn(theme);
                        }
                    } else {
                        return Mono.just(theme); // old theme overwritten, no need to update application
                    }
                });
    }

    @Override
    public Mono<Theme> persistCurrentTheme(String applicationId, Theme resource) {
        return applicationRepository.findById(applicationId, MANAGE_APPLICATIONS)
                .switchIfEmpty(Mono.error(
                        new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, FieldName.APPLICATION, applicationId))
                )
                .flatMap(application -> {
                    String themeId = application.getEditModeThemeId();
                    if(!StringUtils.hasLength(themeId)) {
                        return Mono.error(new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION));
                    } else { // theme id is not present, return default theme
                        return repository.findById(themeId).map(theme -> Tuples.of(theme, application));
                    }
                })
                .flatMap(themeAndApplicationTuple -> {
                    Theme theme = themeAndApplicationTuple.getT1();
                    Application application = themeAndApplicationTuple.getT2();
                    if(theme.isSystemTheme() ||
                            (StringUtils.hasLength(theme.getApplicationId()) && !theme.getApplicationId().equals(applicationId))) {
                        // it's a system theme or already published for another application, throw error
                        return Mono.error(new AppsmithException(AppsmithError.UNSUPPORTED_OPERATION));
                    }
                    theme.setApplicationId(applicationId);
                    theme.setOrganizationId(application.getOrganizationId());
                    if(StringUtils.hasLength(resource.getName())) {
                        theme.setName(resource.getName());
                    } else {
                        theme.setName("Copy of " + theme.getName());
                    }
                    return repository.save(theme);
                });
    }

    /**
     * This method will fetch a theme by id and delete this if it's not a system theme.
     * When an app is published with a customized theme, we store a copy of that theme so that changes are available
     * in published mode even user has changed the theme in edit mode. When user switches back to another theme and
     * publish the application where that app was previously published with a custom theme, we should delete that copy.
     * Otherwise there'll be a lot of orphan theme copies that were set a published mode once but are used no more.
     * @param themeId id of the theme that'll be deleted
     * @return deleted theme mono
     */
    private Mono<Theme> deletePublishedCustomizedThemeCopy(String themeId) {
        if(!StringUtils.hasLength(themeId)) {
            return Mono.empty();
        }
        return repository.findById(themeId).flatMap(theme -> {
            if(!theme.isSystemTheme()) {
                return repository.deleteById(themeId).thenReturn(theme);
            }
            return Mono.just(theme);
        });
    }

    @Override
    public void resetDefaultThemeIdCache() {
        defaultThemeId = null;
    }
}
