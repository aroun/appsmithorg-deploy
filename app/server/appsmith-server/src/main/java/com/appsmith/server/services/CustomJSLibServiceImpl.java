package com.appsmith.server.services;

import com.appsmith.external.models.Policy;
import com.appsmith.server.domains.JSLib;
import com.appsmith.server.repositories.JSLibRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;

import javax.validation.Validator;
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

    @Override
    public Mono<List<JSLib>> getJSLibsByApplicationId(String applicationId) {
        // TODO: fix ACL permission
        return repository.findByApplicationId(applicationId, null)
                .collectList();
    }
}
