package com.appsmith.server.services;

import com.appsmith.server.domains.JSLib;
import reactor.core.publisher.Mono;

import java.util.List;

public interface CustomJSLibService extends CrudService<JSLib, String> {
    Mono<List<JSLib>> getJSLibsByApplicationId(String applicationId);
}
