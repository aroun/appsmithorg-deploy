package com.appsmith.server.services;

import com.appsmith.external.models.Policy;
import com.appsmith.server.constants.FieldName;
import com.appsmith.server.domains.JSLib;
import com.appsmith.server.domains.NewAction;
import com.appsmith.server.exceptions.AppsmithError;
import com.appsmith.server.exceptions.AppsmithException;
import com.appsmith.server.repositories.JSLibRepository;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;

import javax.validation.Validator;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class CustomJSLibServiceImpl extends BaseService<JSLibRepository, JSLib, String> implements CustomJSLibService {

    public CustomJSLibServiceImpl(Scheduler scheduler, Validator validator, MongoConverter mongoConverter,
                                  ReactiveMongoTemplate reactiveMongoTemplate, JSLibRepository repository,
                                  AnalyticsService analyticsService) {
        super(scheduler, validator, mongoConverter, reactiveMongoTemplate, repository, analyticsService);
    }

    @SneakyThrows
    @Override
    public Mono<JSLib> create(JSLib jsLib) {
        // TODO: get type definition from cloud server and set in jsLib object.
        // TODO: create separate copies for published and unpublished.
        // TODO: check if need to add to analytics service. 
        return super.create(jsLib);
    }

    @Override
    public Mono<List<JSLib>> getJSLibsByApplicationId(String applicationId) {
        // TODO: fix ACL permission
        return repository.findByApplicationId(applicationId, null)
                .collectList();
    }

    @Override
    public Mono<JSLib> delete(String id) {
        Mono<JSLib> actionMono = repository.findById(id)
                .switchIfEmpty(Mono.error(new AppsmithException(AppsmithError.NO_RESOURCE_FOUND, FieldName.ACTION, id)));
        return actionMono
                .flatMap(toDelete -> repository.delete(toDelete).thenReturn(toDelete))
                .flatMap(analyticsService::sendDeleteEvent);
    }
}
