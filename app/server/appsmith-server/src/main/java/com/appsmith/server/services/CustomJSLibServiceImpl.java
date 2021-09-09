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
        Runtime rt = Runtime.getRuntime();
        // TODO: move this to cloud.
        Process proc = rt.exec("/Users/sumitsum/Documents/appsmith/as13/app/server/condense.py " + jsLib.getName() +
                " " + jsLib.getVersion());
        BufferedReader stdInput = new BufferedReader(new InputStreamReader(proc.getInputStream()));
        /*BufferedReader stdError = new BufferedReader(new InputStreamReader(proc.getErrorStream()));*/

        // Read the output from the command
        //System.out.println("Here is the standard output of the command:\n");
        String s = null;
        String out = "";
        while ((s = stdInput.readLine()) != null) {
            System.out.println(s);
            out += s;
        }

        jsLib.setAccessor(jsLib.getName());
        jsLib.setJsonTypeDefinition(out);
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
