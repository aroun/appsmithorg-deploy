package com.appsmith.server.repositories;

import com.appsmith.server.domains.Config;
import reactor.core.publisher.Mono;

public interface ConfigRepositoryCE extends BaseRepository<Config, String>, CustomConfigRepository {

    Mono<Config> findByName(String name);
}
